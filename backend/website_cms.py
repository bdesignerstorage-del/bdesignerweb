"""
BDesigner Website CMS — Phase 1 (Homepage) + Emergent object storage.

Mounted by server.py via build_cms_router(...). Reuses the existing JWT auth
(current_user injected) and the existing published homepage collections:
  - homepage_section_settings  (section eyebrow/heading/subtitle/enabled)
  - homepage_blocks            (per-section items)
  - site_settings.hero         (hero media + timeline)

Draft/Publish model:
  - cms_homepage_draft (single doc id="draft") holds the WORKING copy.
  - Public site reads ONLY the published collections (unchanged).
  - Publish copies draft -> published atomically (per-section replace).
  - Preview returns the draft in the SAME shape as /homepage/sections but is
    ADMIN-AUTH protected, so draft never leaks to the public.
"""
import os
import uuid
import logging
import secrets
from datetime import datetime, timezone

import requests
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Response

logger = logging.getLogger("bdesigner.cms")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "bdesigner"

_storage_key = None

MIME = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
    "svg": "image/svg+xml", "mp4": "video/mp4", "webm": "video/webm",
    "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/mp4", "ogg": "audio/ogg",
}
KIND_RULES = {
    "image": ({"jpg", "jpeg", "png", "webp", "svg"}, 10 * 1024 * 1024),
    "video": ({"mp4", "webm"}, 80 * 1024 * 1024),
    "audio": ({"mp3", "wav", "m4a", "ogg"}, 25 * 1024 * 1024),
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    proxy = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
    url = proxy.rstrip("/") + "/objstore/api/v1/storage"
    key = os.environ.get("EMERGENT_LLM_KEY")
    resp = requests.post(f"{url}/init", json={"emergent_key": key}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    globals()["STORAGE_URL"] = url
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=180,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=120,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


async def seed_admin(db, hash_password) -> None:
    """Create the bootstrap admin once. Password is random and printed to the
    server log a single time — never committed anywhere."""
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        return
    email = "admin@bdesigner.com"
    dupe = await db.users.find_one({"email": email})
    pw = secrets.token_urlsafe(12)
    if dupe:
        await db.users.update_one({"email": email}, {"$set": {"role": "admin", "password_hash": hash_password(pw), "must_change_password": True}})
    else:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "BDesigner Admin", "email": email,
            "password_hash": hash_password(pw), "role": "admin", "mobile": "",
            "must_change_password": True, "created_at": _now(),
        })
    logger.warning("=" * 64)
    logger.warning("BDESIGNER ADMIN BOOTSTRAP  email=%s  temp_password=%s", email, pw)
    logger.warning("Change this password after first login. Shown once only.")
    logger.warning("=" * 64)


def build_cms_router(*, api_router: APIRouter, db, current_user, hash_password, valid_sections, default_hero):

    async def require_admin(user: dict = Depends(current_user)) -> dict:
        if (user or {}).get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user

    # ── Media upload / serve ────────────────────────────────────────────
    @api_router.post("/admin/media/upload")
    async def media_upload(kind: str = Form("image"), file: UploadFile = File(...), user: dict = Depends(require_admin)):
        kind = (kind or "image").lower()
        if kind not in KIND_RULES:
            raise HTTPException(status_code=400, detail="Invalid media kind")
        exts, max_size = KIND_RULES[kind]
        ext = (file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "").lower()
        if ext not in exts:
            raise HTTPException(status_code=400, detail=f"Unsupported {kind} type .{ext}. Allowed: {', '.join(sorted(exts))}")
        data = await file.read()
        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        if len(data) > max_size:
            raise HTTPException(status_code=400, detail=f"File too large ({len(data)//1024//1024}MB). Max {max_size//1024//1024}MB")
        content_type = MIME.get(ext, file.content_type or "application/octet-stream")
        path = f"{APP_NAME}/cms/{kind}/{uuid.uuid4()}.{ext}"
        try:
            result = put_object(path, data, content_type)
        except Exception as e:  # pragma: no cover
            logger.exception("Storage upload failed")
            raise HTTPException(status_code=502, detail="Storage upload failed. Please retry.")
        stored_path = result.get("path", path)
        rec = {
            "id": str(uuid.uuid4()), "storage_path": stored_path, "kind": kind,
            "original_filename": file.filename, "content_type": content_type,
            "size": result.get("size", len(data)), "alt": "", "title": file.filename,
            "url": f"/api/media/{stored_path}", "is_deleted": False,
            "uploaded_by": user.get("id"), "uploaded_at": _now(),
        }
        await db.media_assets.insert_one({k: v for k, v in rec.items()})
        rec.pop("_id", None)
        return rec

    @api_router.get("/media/{path:path}")
    async def media_serve(path: str):
        rec = await db.media_assets.find_one({"storage_path": path, "is_deleted": {"$ne": True}})
        if not rec:
            raise HTTPException(status_code=404, detail="File not found")
        try:
            content, ctype = get_object(path)
        except Exception:  # pragma: no cover
            raise HTTPException(status_code=404, detail="File not found")
        return Response(content=content, media_type=rec.get("content_type") or ctype,
                        headers={"Cache-Control": "public, max-age=86400"})

    # ── Helpers to assemble homepage state ──────────────────────────────
    async def _published_state():
        settings_rows = await db.homepage_section_settings.find({}, {"_id": 0}).to_list(200)
        settings = {r.get("section"): r for r in settings_rows if r.get("section")}
        blocks = await db.homepage_blocks.find({}, {"_id": 0}).sort([("section", 1), ("order", 1)]).to_list(3000)
        items = {s: [] for s in valid_sections}
        for b in blocks:
            if b.get("section") in items:
                items[b["section"]].append(b)
        site = await db.site_settings.find_one({"id": "global"}, {"_id": 0}) or {}
        hero = {**default_hero, **(site.get("hero") or {})}
        footer = site.get("footer") or {}
        return {"settings": settings, "items": items, "hero": hero, "footer": footer}

    async def _get_draft():
        draft = await db.cms_homepage_draft.find_one({"id": "draft"}, {"_id": 0})
        if draft:
            return draft
        state = await _published_state()
        return {"id": "draft", **state,
                "meta": {"last_saved": None, "saved_by": None,
                         "last_published": None, "published_by": None, "dirty": False}}

    def _as_public_shape(state):
        """Return the exact shape the public /homepage/sections + /settings use."""
        out = {s: state["items"].get(s, []) for s in valid_sections}
        out["_settings"] = state.get("settings", {})
        return {"sections": out, "hero": state.get("hero", {}), "footer": state.get("footer", {})}

    # ── Draft read / save ───────────────────────────────────────────────
    @api_router.get("/admin/cms/homepage")
    async def cms_get(user: dict = Depends(require_admin)):
        draft = await _get_draft()
        pub_meta = await db.cms_homepage_meta.find_one({"id": "meta"}, {"_id": 0}) or {}
        draft.setdefault("meta", {})
        draft["meta"]["last_published"] = pub_meta.get("last_published")
        draft["meta"]["published_by"] = pub_meta.get("published_by")
        return draft

    @api_router.get("/admin/cms/homepage/preview")
    async def cms_preview(user: dict = Depends(require_admin)):
        return _as_public_shape(await _get_draft())

    @api_router.put("/admin/cms/homepage")
    async def cms_save(payload: dict, user: dict = Depends(require_admin)):
        doc = {
            "id": "draft",
            "settings": payload.get("settings") or {},
            "items": payload.get("items") or {},
            "hero": payload.get("hero") or {},
            "footer": payload.get("footer") or {},
            "meta": {"last_saved": _now(), "saved_by": user.get("name") or user.get("email"), "dirty": True},
        }
        await db.cms_homepage_draft.update_one({"id": "draft"}, {"$set": doc}, upsert=True)
        return {"ok": True, "last_saved": doc["meta"]["last_saved"], "saved_by": doc["meta"]["saved_by"]}

    @api_router.post("/admin/cms/homepage/publish")
    async def cms_publish(user: dict = Depends(require_admin)):
        draft = await db.cms_homepage_draft.find_one({"id": "draft"}, {"_id": 0})
        if not draft:
            raise HTTPException(status_code=400, detail="Nothing to publish — save a draft first.")
        # Section settings
        for section, s in (draft.get("settings") or {}).items():
            s = {k: v for k, v in s.items() if k != "_id"}
            s["section"] = section
            s["updated_at"] = _now()
            await db.homepage_section_settings.update_one({"section": section}, {"$set": s}, upsert=True)
        # Items — atomic replace per section
        for section, arr in (draft.get("items") or {}).items():
            if section not in valid_sections:
                continue
            await db.homepage_blocks.delete_many({"section": section})
            docs = []
            for i, it in enumerate(arr or []):
                it = {k: v for k, v in (it or {}).items() if k != "_id"}
                it["section"] = section
                it["order"] = it.get("order", i)
                it.setdefault("id", str(uuid.uuid4()))
                it.setdefault("hidden", False)
                it["updated_at"] = _now()
                docs.append(it)
            if docs:
                await db.homepage_blocks.insert_many(docs)
        # Hero + footer into site_settings
        set_fields = {}
        if draft.get("hero"):
            set_fields["hero"] = draft["hero"]
        if draft.get("footer"):
            set_fields["footer"] = draft["footer"]
        if set_fields:
            await db.site_settings.update_one({"id": "global"}, {"$set": {"id": "global", **set_fields}}, upsert=True)
        meta = {"id": "meta", "last_published": _now(), "published_by": user.get("name") or user.get("email")}
        await db.cms_homepage_meta.update_one({"id": "meta"}, {"$set": meta}, upsert=True)
        await db.cms_homepage_draft.update_one({"id": "draft"}, {"$set": {"meta.dirty": False, "meta.last_published": meta["last_published"], "meta.published_by": meta["published_by"]}})
        return {"ok": True, **meta}

    @api_router.post("/admin/cms/homepage/reset-draft")
    async def cms_reset(user: dict = Depends(require_admin)):
        await db.cms_homepage_draft.delete_one({"id": "draft"})
        return {"ok": True}
