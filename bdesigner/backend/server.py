"""BDesigner clean public-web backend.

This backend intentionally contains only the APIs required by the preserved
public homepage, project detail page, existing auth modal, public enquiry form,
search overlay, share/comment tracking, and optional homepage advisor UI.

All legacy ERP, marketplace, Brand Partner, Admin, PM, engineer, commercial,
BOQ, package, payment, agreement, procurement, and execution APIs were removed
from this cleaned baseline.
"""
from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional
import os
import re
import uuid

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

from homepage_cms import VALID_SECTIONS, seed_homepage_defaults

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "bdesigner")
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TTL = timedelta(days=7)

client = AsyncIOMotorClient(MONGO_URL)
try:
    db = client.get_default_database()
    if db is None:
        db = client[DB_NAME]
except Exception:
    db = client[DB_NAME]

app = FastAPI(title="BDesigner Public Web API")
api = APIRouter(prefix="/api")

allowed_origins = [x.strip() for x in os.environ.get("CORS_ORIGINS", "*").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=(allowed_origins != ["*"]),
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    return jwt.encode(
        {"sub": user_id, "email": email, "type": "access", "exp": datetime.now(timezone.utc) + ACCESS_TTL},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def set_auth_cookie(response: Response, token: str) -> None:
    secure = os.environ.get("COOKIE_SECURE", "true").lower() == "true"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure,
        samesite="none" if secure else "lax",
        max_age=int(ACCESS_TTL.total_seconds()),
        path="/",
    )


async def current_user_optional(request: Request) -> Optional[dict]:
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        return user
    except Exception:
        return None


async def current_user(request: Request) -> dict:
    user = await current_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: Optional[str] = ""
    role: Optional[str] = "client"


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False


class CommentIn(BaseModel):
    text: str
    rating: Optional[int] = None


class TrackIn(BaseModel):
    entity_type: str
    entity_id: str
    action: str
    destination: Optional[str] = None


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@api.get("/health")
async def health():
    return {"status": "ok", "scope": "public-homepage-clean"}


# ---------------------------------------------------------------------------
# Auth required by the existing homepage Login / Create Account modal
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    role = (payload.role or "client").strip().lower()
    if role not in {"client", "customer"}:
        role = "client"
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "phone": re.sub(r"\D", "", payload.mobile or ""),
        "password_hash": hash_password(payload.password),
        "role": role,
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={payload.name}",
        "active": True,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    set_auth_cookie(response, token)
    return {k: doc.get(k) for k in ("id", "name", "email", "role", "avatar")} | {"token": token}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash") or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("active") is False:
        raise HTTPException(status_code=403, detail="Your account is not active.")
    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": now_iso()}})
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": email,
        "role": user.get("role", "client"),
        "avatar": user.get("avatar"),
        "must_change_password": False,
        "token": token,
    }


@api.get("/auth/me")
async def auth_me(user: dict = Depends(current_user)):
    return user


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.post("/auth/forgot")
async def forgot_password():
    # The legacy email/reset subsystem was intentionally removed with the ERP.
    # Do not pretend a reset email was sent.
    raise HTTPException(
        status_code=503,
        detail="Password reset email is temporarily unavailable while the new account system is being rebuilt.",
    )


@api.get("/auth/google/login")
async def google_login_unavailable():
    raise HTTPException(status_code=503, detail="Google login is not configured in this clean baseline.")


# ---------------------------------------------------------------------------
# Public website settings
# ---------------------------------------------------------------------------
DEFAULT_SETTINGS = {
    "id": "global",
    "site_name": "BDesigner",
    "tagline": "Design Your Dream Home",
    "logo": "/bdesigner-logo.png",
    "logo_dark": "/bdesigner-logo-white.png",
    "logo_light": "/bdesigner-logo.png",
    "logo_mobile": "/bdesigner-logo-trim.png",
    "logo_footer": "/bdesigner-logo-white.png",
    "favicon": "/bdesigner-logo-trim.png",
    "footer": {
        "about_text": "India's trusted architecture and turnkey construction platform.",
        "contact": {"email": "hello@bdesigner.com", "phone": "", "address": "India"},
        "social": [],
    },
}


@api.get("/settings")
async def get_settings():
    doc = await db.site_settings.find_one({"id": "global"}, {"_id": 0})
    return {**DEFAULT_SETTINGS, **(doc or {})}


# ---------------------------------------------------------------------------
# Homepage CMS read model only
# ---------------------------------------------------------------------------
@api.get("/homepage/sections")
async def homepage_sections():
    out = {s: [] for s in VALID_SECTIONS}
    rows = await db.homepage_blocks.find(
        {"hidden": {"$ne": True}}, {"_id": 0}
    ).sort([("section", 1), ("order", 1)]).to_list(2000)
    for row in rows:
        section = row.get("section")
        if section in out:
            out[section].append(row)
    settings_rows = await db.homepage_section_settings.find({}, {"_id": 0}).to_list(200)
    out["_settings"] = {r.get("section"): r for r in settings_rows if r.get("section")}
    return out


# ---------------------------------------------------------------------------
# Public portfolio used by Homepage Trending Projects + Project Detail
# ---------------------------------------------------------------------------
@api.get("/projects")
async def list_projects(
    sort: str = Query("trending"),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
):
    query = {"is_deleted": {"$ne": True}}
    if category:
        query["category"] = category
    sort_key = {"trending": "views", "newest": "created_at", "popular": "views", "shared": "shares"}.get(sort, "views")
    return await db.projects.find(
        query,
        {"_id": 0, "liked_by": 0, "saved_by": 0, "likes": 0, "saves": 0},
    ).sort(sort_key, -1).limit(limit).to_list(limit)


@api.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one(
        {"id": project_id, "is_deleted": {"$ne": True}},
        {"_id": 0, "liked_by": 0, "saved_by": 0, "likes": 0, "saves": 0},
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.projects.update_one({"id": project_id}, {"$inc": {"views": 1}})
    project["views"] = int(project.get("views") or 0) + 1
    return project


@api.post("/projects/{project_id}/share")
async def share_project(project_id: str, request: Request, payload: Optional[dict] = None):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0, "id": 1})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    user = await current_user_optional(request)
    await db.share_events.insert_one({
        "id": str(uuid.uuid4()),
        "kind": "project",
        "target_id": project_id,
        "source": ((payload or {}).get("source") or "unknown")[:32],
        "user_id": user.get("id") if user else None,
        "created_at": now_iso(),
    })
    await db.projects.update_one({"id": project_id}, {"$inc": {"shares": 1}})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0, "shares": 1})
    return {"shares": int((updated or {}).get("shares") or 0)}


@api.get("/projects/{project_id}/comments")
async def list_project_comments(project_id: str):
    return await db.comments.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/projects/{project_id}/comments")
async def add_project_comment(project_id: str, payload: CommentIn, user: dict = Depends(current_user)):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "user_id": user["id"],
        "user_name": user.get("name", "Client"),
        "avatar": user.get("avatar"),
        "text": payload.text.strip(),
        "rating": payload.rating,
        "likes": 0,
        "created_at": now_iso(),
    }
    await db.comments.insert_one(doc)
    await db.projects.update_one({"id": project_id}, {"$inc": {"comments": 1}})
    doc.pop("_id", None)
    return doc


@api.get("/projects/{project_id}/report.pdf")
async def removed_report_generator(project_id: str):
    raise HTTPException(
        status_code=501,
        detail="The legacy project PDF generator was removed from this clean homepage baseline.",
    )


# ---------------------------------------------------------------------------
# Search overlay — projects only in the clean public baseline
# ---------------------------------------------------------------------------
@api.get("/search")
async def search(q: str, limit: int = 6):
    term = (q or "").strip()
    if not term:
        return {"projects": []}
    rx = {"$regex": re.escape(term), "$options": "i"}
    lim = max(1, min(int(limit or 6), 25))
    projects = await db.projects.find(
        {"is_deleted": {"$ne": True}, "$or": [{"title": rx}, {"description": rx}, {"style": rx}]},
        {"_id": 0, "liked_by": 0, "saved_by": 0},
    ).limit(lim).to_list(lim)
    return {"projects": projects}


# ---------------------------------------------------------------------------
# Public lead form on the preserved homepage
# ---------------------------------------------------------------------------
@api.post("/erp/enquiries")
async def public_enquiry(payload: dict, request: Request):
    name = str(payload.get("full_name") or "").strip()
    mobile = re.sub(r"\D", "", str(payload.get("mobile") or ""))
    if not name:
        raise HTTPException(status_code=400, detail="Please enter your full name.")
    if len(mobile) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
    doc = {
        "id": str(uuid.uuid4()),
        "full_name": name,
        "mobile": mobile,
        "email": payload.get("email"),
        "service_area": payload.get("service_area"),
        "main_area": payload.get("main_area"),
        "location": payload.get("location"),
        "plot_size": payload.get("plot_size"),
        "budget": payload.get("budget"),
        "project_type": payload.get("project_type"),
        "message": payload.get("message"),
        "start_date": payload.get("start_date"),
        "source": payload.get("source") or "website",
        "estimate": payload.get("estimate"),
        "ip": request.client.host if request.client else None,
        "status": "new",
        "created_at": now_iso(),
    }
    await db.public_enquiries.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


# ---------------------------------------------------------------------------
# Lightweight click tracking used by project detail
# ---------------------------------------------------------------------------
@api.post("/track")
async def track_click(payload: TrackIn, request: Request):
    user = await current_user_optional(request)
    await db.clicks.insert_one({
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "user_id": user.get("id") if user else None,
        "user_agent": request.headers.get("user-agent", "")[:200],
        "referrer": request.headers.get("referer", "")[:200],
        "created_at": now_iso(),
    })
    return {"ok": True}


@app.on_event("startup")
async def startup_seed_homepage():
    try:
        await seed_homepage_defaults(db)
    except Exception:
        # Existing production databases already contain homepage content; a
        # seed failure must not block the public website from starting.
        pass


app.include_router(api)


@app.get("/")
async def root():
    return {"service": "BDesigner Public Web API", "status": "ok"}
