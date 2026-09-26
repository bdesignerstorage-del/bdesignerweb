"""Homepage CMS — Phase 1.

Manages editable content blocks rendered on the public House-Owner homepage:

    section = "trust_indicator"     — small horizontal-scroll trust cards
    section = "construction_step"   — 8-step "How it works" cards
    section = "guarantee"           — "Guarantees You Deserve" items
    section = "advisor_benefit"     — bullets next to the Construction Advisor
                                      lead form

All items share the same shape so the admin UI can be a single tabbed page.

Collections:
    db.homepage_blocks   — items (one document per card)
    db.crm_leads         — public homepage form posts a CRM lead here
                           (reuses the existing collection from crm.py)

Public endpoints (no auth):
    GET  /api/homepage/sections        — returns published items grouped
                                          by section, sorted by `order`.
    POST /api/crm/public-lead          — creates a CRM lead from any
                                          homepage CTA (compact form).

Admin endpoints (require_admin):
    GET    /api/admin/homepage/items?section=...
    POST   /api/admin/homepage/items
    PATCH  /api/admin/homepage/items/{item_id}
    DELETE /api/admin/homepage/items/{item_id}
    POST   /api/admin/homepage/items/reorder   {section, ids: [..]}

The seed routine inserts a sensible default set of items per section so
the homepage is never empty on a fresh install.
"""
from __future__ import annotations

import logging
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger("homepage_cms")


def _parse_budget_number(raw) -> float:
    """Extract a plausible number from strings like "₹40L - ₹60L", "50 lakh",
    "1.2 cr". Returns 0 when nothing sensible can be parsed. Used to seed the
    numeric `budget` field on the CRM v2 project doc.
    """
    if not raw:
        return 0.0
    s = str(raw).lower().strip()
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)", s)
    if not m:
        return 0.0
    n = float(m.group(1))
    if "cr" in s or "crore" in s:
        return n * 1_00_00_000  # 1 crore
    if "l" in s or "lakh" in s or "lac" in s:
        return n * 1_00_000
    if "k" in s or "thousand" in s:
        return n * 1000
    return n

VALID_SECTIONS = (
    "trust_indicator",
    "construction_step",
    "guarantee",
    "advisor_benefit",
    # Phase 2
    "service_area",         # Main / sub areas inside a region (e.g. Whitefield)
    "service_area_region",  # Top-level region (e.g. Bengaluru) for the
                            # cascading lead-form dropdown
    "homeowner_review",     # Reviews carousel (no photos)
    "construction_package", # Basic / Classic / Premium / Luxury
    "comparison_feature",   # Why Choose BDesigner table
    "trusted_brand",        # Logo carousel
    "faq",                  # FAQ accordion
    # Phase 3 (Homepage CMS completion)
    "shop_by_category",     # Shop by category tiles (image + linked cat)
    "cta_section",          # Final CTA before footer (singleton)
)

# Sections that carry section-level settings only (no items) or where
# items are managed elsewhere. The CMS surfaces just the header +
# heading/subtitle + enable toggle for these.
TOGGLE_ONLY_SECTIONS = (
    "trending_materials",       # virtual — auto-fetched from Materials module
    "construction_package",     # items managed via Packages module
)

# Default section-level settings (heading + subtitle) so the public site
# always has a title even before an admin edits it.
DEFAULT_SECTION_SETTINGS = {
    "hero_banner":         {"heading": "",                                 "subtitle": ""},
    "trust_indicator":     {"heading": "Trusted by Homeowners Across India","subtitle": "Real numbers. Real customers. Real results."},
    "shop_by_category":    {"heading": "Shop by Category",                 "subtitle": "Browse premium materials across every construction stage."},
    "trending_materials":  {"heading": "Trending Materials",               "subtitle": "Freshly added, most-loved materials handpicked by our engineers."},
    "construction_step":   {"heading": "How Construction Works",           "subtitle": "A transparent 8-step process from idea to keys handover."},
    "service_area":        {"heading": "Available in Bengaluru",           "subtitle": "Currently serving 12+ localities and expanding fast."},
    "guarantee":           {"heading": "Guarantees You Deserve",           "subtitle": "Every BDesigner project ships with these commitments."},
    "construction_package":{"heading": "Construction Packages",            "subtitle": "Fixed-price, verified-material packages that fit every budget."},
    "comparison_feature":  {"heading": "Why Choose BDesigner",             "subtitle": "The clear difference between us and a traditional contractor."},
    "homeowner_review":    {"heading": "What Our Homeowners Say",          "subtitle": "5-star rated by families who've built their dream homes."},
    "faq":                 {"heading": "Frequently Asked Questions",       "subtitle": "Everything you need to know before starting your project."},
    "trusted_brand":       {"heading": "Trusted Brands We Work With",      "subtitle": "Only ISI-certified, tier-1 brands make it into our supply chain."},
    "cta_section":         {"heading": "Ready to Build Your Dream Home?",  "subtitle": "Book a free 30-minute consultation with our construction advisors."},
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ───────────────────────────────────────────────────────────────────────
# Models
# ───────────────────────────────────────────────────────────────────────
class HomepageItemIn(BaseModel):
    section: str
    title: Optional[str] = ""           # primary text / step name
    description: Optional[str] = ""     # supporting text
    icon: Optional[str] = ""            # lucide-react icon name string
    image_url: Optional[str] = ""       # for guarantees (right-panel image)
    value: Optional[str] = ""           # for trust indicators ("10,000+")
    label: Optional[str] = ""           # for trust indicators ("Designs")
    link_url: Optional[str] = ""        # external link (trusted brands)
    meta: Optional[dict] = None         # free-form structured data
                                        #   packages → {price, period, popular, specs[], accordion[], button_label}
                                        #   comparison_feature → {bdesigner, others}
                                        #   faq → {answer}
                                        #   homeowner_review → {rating, city}
                                        #   trusted_brand → {logo_url}
                                        #   service_area → {is_available}
    order: Optional[int] = 0
    hidden: Optional[bool] = False


class HomepageItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    value: Optional[str] = None
    label: Optional[str] = None
    link_url: Optional[str] = None
    meta: Optional[dict] = None
    order: Optional[int] = None
    hidden: Optional[bool] = None


class ReorderIn(BaseModel):
    section: str
    ids: List[str] = Field(default_factory=list)


class SectionSettingsIn(BaseModel):
    heading: Optional[str] = None
    subtitle: Optional[str] = None
    enabled: Optional[bool] = None
    status: Optional[str] = None   # "published" | "draft"
    meta: Optional[dict] = None    # section-level extras
                                   #   guarantee → {hero_image_url, button_text, button_link}
                                   #   service_area → {hero_image_url, city_name}


class PublicLeadIn(BaseModel):
    """Unified consultation form posted from every CTA on the public site.
    The compact modal captures Name + Phone + Service Area + Main Area, and
    the extended (Construction Advisor) form also sends plot / budget /
    start date. `source` is auto-set by the front-end button (hero,
    packages, process, guarantees, advisor, sticky, footer, etc.)."""
    full_name: str
    mobile: str
    city: Optional[str] = ""
    source: Optional[str] = "homepage"     # which CTA fired the modal
    # Optional richer fields (Construction Advisor + unified LeadModal)
    plot_size: Optional[str] = ""
    budget: Optional[str] = ""
    start_date: Optional[str] = ""
    notes: Optional[str] = ""
    # NEW (Fix 9): structured service/main-area labels + free-form meta.
    # These are the human-readable labels of the cascading dropdowns
    # (e.g. service_area_label="Bengaluru", main_area_label="Whitefield").
    # They are stored so admin CRM shows the exact selection the user made.
    meta: Optional[dict] = None


def _strip(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def _touch_section(db, section: str, actor_id, actor_name: str) -> None:
    """Bump section-level updated_at / updated_by whenever an item under
    the section is created, updated, deleted or reordered."""
    if not section:
        return
    try:
        await db.homepage_section_settings.update_one(
            {"section": section},
            {
                "$set": {
                    "updated_at": _now(),
                    "updated_by_id": actor_id,
                    "updated_by_name": actor_name or "admin",
                },
                "$setOnInsert": {"section": section, "enabled": True, "status": "published"},
            },
            upsert=True,
        )
    except Exception:                                              # pragma: no cover
        pass


async def ensure_homepage_indexes(db):
    try:
        await db.homepage_blocks.create_index("id", unique=True)
        await db.homepage_blocks.create_index([("section", 1), ("order", 1)])
        await db.homepage_section_settings.create_index("section", unique=True)
    except Exception as e:                                       # pragma: no cover
        logger.warning("Could not create homepage_blocks indexes: %s", e)


# ───────────────────────────────────────────────────────────────────────
# Default content (seed)
# ───────────────────────────────────────────────────────────────────────
DEFAULT_TRUST_INDICATORS = [
    {"value": "10,000+", "label": "Designs",                "icon": "Layers"},
    {"value": "500+",    "label": "Verified Engineers",     "icon": "BadgeCheck"},
    {"value": "50,000+", "label": "Materials",              "icon": "Package"},
    {"value": "4.9",     "label": "Customer Rating",        "icon": "Star"},
]

# Approved 8-step business flow (docs/design.md §16 + rules.md lifecycle).
DEFAULT_CONSTRUCTION_STEPS = [
    {"title": "Share Requirement",       "description": "Tell us your plot, floor needs, style preferences and the services you need.",                   "icon": "FileText"},
    {"title": "Get Pricing",             "description": "View your architectural service charges clearly based on your selected requirements.",            "icon": "BadgeIndianRupee"},
    {"title": "Create Account",          "description": "Register to continue your project, track updates and work with the BDesigner team.",              "icon": "UserCheck"},
    {"title": "Team Assigned",           "description": "Admin reviews your lead and assigns the right architect / structural team for your project.",     "icon": "Users"},
    {"title": "Design & Review",         "description": "Drawings are prepared, shared for review and refined through the approved feedback process.",     "icon": "PencilRuler"},
    {"title": "Final Drawings + BOQ",    "description": "Final approved drawings and BOQ/estimation are prepared and organized in your project library.","icon": "FileCheck"},
    {"title": "Construction Proposal",   "description": "If construction is required, we prepare your package, proposal, inclusions and payment plan.",    "icon": "FileSpreadsheet"},
    {"title": "Construction Execution",  "description": "After approval, agreement and initial payment, construction progress and site updates begin.",    "icon": "HardHat"},
]

DEFAULT_GUARANTEES = [
    {"title": "Transparent Pricing",       "description": "Clear architectural charges, package rates and approved variations before work proceeds.",                 "icon": "BadgeIndianRupee", "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=70"},
    {"title": "Dedicated Project Manager", "description": "One project manager coordinates your project, team, approvals and key updates.",                            "icon": "UserCheck",        "image_url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=70"},
    {"title": "Structured Design Review",  "description": "Drawings follow a clear draft, review, feedback and approval workflow.",                                    "icon": "PencilRuler",      "image_url": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=70"},
    {"title": "Final Drawings + BOQ",      "description": "Approved project drawings and BOQ are organized before construction proposal preparation.",                  "icon": "FileSpreadsheet",  "image_url": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=70"},
    {"title": "Stage-wise Site Updates",   "description": "Construction clients receive progress updates, site photos and current-stage information.",                  "icon": "HardHat",          "image_url": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=70"},
    {"title": "Handover Documentation",    "description": "Final drawings, project documents, payment records and completion documents remain organized in one place.", "icon": "FileCheck",        "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=70"},
]

DEFAULT_ADVISOR_BENEFITS = [
    {"title": "Budget Planning",         "icon": "Wallet"},
    {"title": "Cost Estimation",         "icon": "Calculator"},
    {"title": "Material Guidance",       "icon": "PackageSearch"},
    {"title": "Construction Timeline",   "icon": "CalendarClock"},
    {"title": "Dedicated Project Manager","icon": "UserCheck"},
    {"title": "Site Planning",           "icon": "Map"},
]

# ── Phase 2 defaults ───────────────────────────────────────────────────
DEFAULT_SERVICE_AREA_REGIONS = [
    {"label": "Bengaluru", "title": "Bengaluru", "icon": "MapPin"},
]

DEFAULT_SERVICE_AREAS = [
    {"label": "Banashankari",     "icon": "MapPin"},
    {"label": "RR Nagar",         "icon": "MapPin"},
    {"label": "Whitefield",       "icon": "MapPin"},
    {"label": "HSR Layout",       "icon": "MapPin"},
    {"label": "JP Nagar",         "icon": "MapPin"},
    {"label": "Electronic City",  "icon": "MapPin"},
    {"label": "Indiranagar",      "icon": "MapPin"},
    {"label": "Koramangala",      "icon": "MapPin"},
    {"label": "Marathahalli",     "icon": "MapPin"},
    {"label": "Sarjapur Road",    "icon": "MapPin"},
    {"label": "Yelahanka",        "icon": "MapPin"},
    {"label": "Hebbal",           "icon": "MapPin"},
]

DEFAULT_HOMEOWNER_REVIEWS = [
    {"title": "Rahul Verma", "description": "BDesigner delivered our 3BHK in 11 months — exactly as committed. The PM was incredibly responsive and the digital BOQ made every cost transparent.",
     "meta": {"rating": 5, "city": "Whitefield, Bengaluru"}},
    {"title": "Priya Nair",  "description": "From design to handover, no surprises. The fixed-pricing guarantee saved us from the usual ₹5L+ overruns my friends faced. Highly recommend.",
     "meta": {"rating": 5, "city": "JP Nagar, Bengaluru"}},
    {"title": "Anand Krishnan","description":"The site visits, weekly photos, and quality reports kept us informed even though we were in the US. Construction tracking on the app was a lifesaver.",
     "meta": {"rating": 5, "city": "HSR Layout, Bengaluru"}},
    {"title": "Sneha Iyer",  "description": "Loved how they connected us with verified suppliers — got premium tiles 22% cheaper than retail. Real value-add over a traditional contractor.",
     "meta": {"rating": 4, "city": "Banashankari, Bengaluru"}},
    {"title": "Vikram Reddy","description": "Top-class structural engineering. Built our duplex on a tricky plot — they handled drainage, soil and BBMP approvals end to end.",
     "meta": {"rating": 5, "city": "Sarjapur Road, Bengaluru"}},
    {"title": "Meera Pillai","description": "Premium finish, premium service. The 2-year warranty pack and 1-year free service we got after handover gave us total peace of mind.",
     "meta": {"rating": 5, "city": "Indiranagar, Bengaluru"}},
]

DEFAULT_PACKAGES = [
    {"title": "Basic",   "description": "Smart, no-frills construction with verified materials and trusted brands.",
     "meta": {
         "price": "1,699", "period": "/sqft", "popular": False, "button_label": "Talk to Expert",
         "specs": [
            {"label": "Design", "value": "1 Floor Plan + 1 3D Elevation"},
            {"label": "Structural", "value": "Standard RCC + ISI Steel"},
            {"label": "Brick", "value": "Solid Concrete Blocks"},
            {"label": "Warranty", "value": "5 years structural"},
         ],
         "accordion": [
            {"title": "Steel & Cement", "content": "TMT Fe-500 ISI-certified steel (Tata Tiscon or equivalent) and 53-grade OPC cement (UltraTech or equivalent)."},
            {"title": "Doors & Windows","content": "Main door teak-finish flush, internal doors WPC, UPVC windows with mosquito mesh."},
            {"title": "Tiles & Flooring","content": "Vitrified tiles 600x600mm (₹50/sqft range) for living + bedrooms, anti-skid for bathrooms."},
            {"title": "Bathroom",       "content": "Jaquar Continental series CP fittings, single wash basin, branded sanitaryware."},
            {"title": "Electrical",     "content": "Havells / Anchor switches, single-phase wiring, 8 light points + 6 plug points per room."},
            {"title": "Painting",       "content": "Asian Paints Tractor Emulsion (interior), Apex Ultima (exterior)."},
         ],
     }},
    {"title": "Classic", "description": "Our most-loved package. Mid-premium finishes and a great cost-to-value ratio.",
     "meta": {
         "price": "1,999", "period": "/sqft", "popular": True, "button_label": "Talk to Expert",
         "specs": [
            {"label": "Design", "value": "2 Floor Plans + 2 3D Elevations + Site Plan"},
            {"label": "Structural", "value": "M25 Concrete + Fe-550 Steel"},
            {"label": "Brick", "value": "AAC Blocks (lighter, insulated)"},
            {"label": "Warranty", "value": "7 years structural + 2 years finish"},
         ],
         "accordion": [
            {"title": "Steel & Cement", "content": "Tata Tiscon Fe-550 steel and UltraTech PPC 53-grade cement. M25 concrete grade."},
            {"title": "Doors & Windows","content": "Teak main door, engineered wood internal doors, UPVC sliding windows + safety grills."},
            {"title": "Tiles & Flooring","content": "Premium vitrified tiles (₹80-100/sqft) for living areas, marble-finish flooring upgrade available."},
            {"title": "Bathroom",       "content": "Jaquar Aria series, geyser pre-wiring, concealed plumbing with Astral CPVC."},
            {"title": "Electrical",     "content": "Schneider/Anchor Roma switches, modular wiring, smart-home ready, MCB protection."},
            {"title": "Painting",       "content": "Asian Paints Premium Emulsion interior, Apex Ultra exterior with 7-year warranty."},
            {"title": "Kitchen",        "content": "L-shape granite counter, 1 SS sink, Kajaria backsplash up to 2'."},
         ],
     }},
    {"title": "Premium", "description": "Premium materials, designer finishes and project manager-led execution.",
     "meta": {
         "price": "2,399", "period": "/sqft", "popular": False, "button_label": "Talk to Expert",
         "specs": [
            {"label": "Design", "value": "Unlimited revisions + Interior moodboard"},
            {"label": "Structural", "value": "M30 Concrete + Fe-600 TMT"},
            {"label": "Brick", "value": "AAC Premium + ICF Blocks"},
            {"label": "Warranty", "value": "10 years structural + 5 years finish"},
         ],
         "accordion": [
            {"title": "Steel & Cement", "content": "Tata Tiscon Super Links Fe-600, UltraTech Premium 53-grade. M30 concrete + waterproofing on terraces."},
            {"title": "Doors & Windows","content": "Solid teak main door with brass fittings, designer internal doors, German-engineered UPVC."},
            {"title": "Tiles & Flooring","content": "Imported vitrified or Italian marble (₹150-250/sqft range), engineered wood for bedrooms."},
            {"title": "Bathroom",       "content": "Jaquar Lyric / Kohler series, geysers, false ceiling, designer LED mirrors, Hindware sanitaryware."},
            {"title": "Electrical",     "content": "Schneider Livia or Legrand Arteor, smart switches, CCTV pre-wiring, automation-ready."},
            {"title": "Painting",       "content": "Asian Paints Royale interior, Apex Ultima Protek exterior — 10-year warranty."},
            {"title": "Kitchen",        "content": "Modular kitchen, quartz/granite counter, chimney + hob pre-installed plumbing."},
            {"title": "Premium Add-ons","content": "Rainwater harvesting, solar pre-wiring, intercom, video doorbell."},
         ],
     }},
    {"title": "Luxury",  "description": "Bespoke architecture, imported finishes and white-glove handover.",
     "meta": {
         "price": "Custom", "period": "", "popular": False, "button_label": "Get a Custom Quote",
         "specs": [
            {"label": "Design", "value": "Bespoke architecture + Interior design"},
            {"label": "Structural", "value": "Custom mix design + post-tensioned where needed"},
            {"label": "Materials", "value": "Imported tiles, marble, hardware"},
            {"label": "Warranty", "value": "15 years structural + 10 years finish"},
         ],
         "accordion": [
            {"title": "Architecture",   "content": "Dedicated principal architect, 3D walkthrough VR, sustainable design certification (IGBC/LEED) option."},
            {"title": "Materials",      "content": "Italian marble, imported veneers, Kohler / Toto bath fittings, smart home integration."},
            {"title": "Interiors",      "content": "Full interior design fee included — moodboards, lighting design, custom carpentry."},
            {"title": "Landscaping",    "content": "Hardscape + softscape design, lawn, water feature, outdoor lighting."},
            {"title": "Smart Home",     "content": "Lutron / Crestron lighting, full home automation, security, integrated audio."},
            {"title": "Concierge",      "content": "Dedicated PM, weekly architect walkthrough, white-glove handover with snag-free certification."},
         ],
     }},
]

DEFAULT_COMPARISON = [
    {"title": "Architecture + Construction Workflow", "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Transparent Architectural Pricing",    "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Dedicated Project Manager",            "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Drawing Review & Revisions",           "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Project-based Team Communication",     "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Central Project Documents",            "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Construction Progress & Site Updates", "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Package / Proposal Transparency",      "meta": {"bdesigner": "yes", "others": "partial"}},
    {"title": "Handover & Completion Records",        "meta": {"bdesigner": "yes", "others": "partial"}},
]

DEFAULT_TRUSTED_BRANDS = [
    {"label": "Asian Paints",   "meta": {"logo_url": "https://logo.clearbit.com/asianpaints.com"}},
    {"label": "UltraTech",      "meta": {"logo_url": "https://logo.clearbit.com/ultratechcement.com"}},
    {"label": "Kajaria",        "meta": {"logo_url": "https://logo.clearbit.com/kajariaceramics.com"}},
    {"label": "Jaquar",         "meta": {"logo_url": "https://logo.clearbit.com/jaquar.com"}},
    {"label": "Havells",        "meta": {"logo_url": "https://logo.clearbit.com/havells.com"}},
    {"label": "Berger Paints",  "meta": {"logo_url": "https://logo.clearbit.com/bergerpaints.com"}},
    {"label": "Tata Steel",     "meta": {"logo_url": "https://logo.clearbit.com/tatasteel.com"}},
    {"label": "Saint-Gobain",   "meta": {"logo_url": "https://logo.clearbit.com/saint-gobain.com"}},
    {"label": "Hindware",       "meta": {"logo_url": "https://logo.clearbit.com/hindware.com"}},
    {"label": "Astral",         "meta": {"logo_url": "https://logo.clearbit.com/astralpipes.com"}},
]

DEFAULT_FAQS = [
    {"title": "How long does a typical project take?",
     "meta": {"answer": "An average 2,000 sqft home takes 9–12 months from kick-off to handover, including design, approvals, and finishing. We commit to the timeline contractually with penalty clauses for any delay caused by us."}},
    {"title": "What is BDesigner's pricing model?",
     "meta": {"answer": "We work on a fixed-rate per-sqft model. The quote you sign at agreement is the final amount you'll pay, unless you choose to upgrade materials or add scope. Every change order is digitally approved by you before work proceeds."}},
    {"title": "Do I need to source materials separately?",
     "meta": {"answer": "No. Every package includes verified materials from premium Indian brands (Tata Steel, UltraTech, Asian Paints, Jaquar, etc). You can optionally upgrade any material from our marketplace at preferred customer rates."}},
    {"title": "Is the construction supervised?",
     "meta": {"answer": "Yes. You get a dedicated Project Manager, a Site Engineer for daily checks, and weekly QC reports on the BDesigner app — including site photos, milestone progress, and material delivery logs."}},
    {"title": "What about post-handover support?",
     "meta": {"answer": "Every project ships with a structural warranty (5–15 years depending on package), a 1-year free finishing-service period (cracks, paint touch-ups, plumbing leaks, etc), and lifetime maintenance support at preferred rates."}},
    {"title": "Can I bring my own architect or contractor?",
     "meta": {"answer": "Absolutely. Many clients work with us only for the execution + ERP layer while their own architect handles design. We have specific 'Build Only' and 'Design Only' engagement models for this."}},
]

# ── Phase 3 defaults (Shop-by-Category + CTA singleton) ────────────────
DEFAULT_SHOP_CATEGORIES = [
    {"label": "Cement",  "title": "Cement",  "icon": "Building2",  "meta": {"category_id": ""}},
    {"label": "Steel",   "title": "Steel",   "icon": "Anchor",     "meta": {"category_id": ""}},
    {"label": "Tiles",   "title": "Tiles",   "icon": "LayoutGrid", "meta": {"category_id": ""}},
    {"label": "Paints",  "title": "Paints",  "icon": "Paintbrush", "meta": {"category_id": ""}},
    {"label": "Bath",    "title": "Bath",    "icon": "Bath",       "meta": {"category_id": ""}},
    {"label": "Kitchen", "title": "Kitchen", "icon": "ChefHat",    "meta": {"category_id": ""}},
]

DEFAULT_CTA_SECTION = [
    {"title": "Ready to Build Your Dream Home?",
     "description": "Book a free 30-minute consultation with our construction advisors. Fixed pricing, verified materials, dedicated project manager.",
     "meta": {
        "primary_button_text":  "Book Free Consultation",
        "primary_button_link":  "/consultation",
        "whatsapp_number":      "+919999999999",
        "whatsapp_button_text": "WhatsApp Us",
        "background_color":     "#0F172A",
     }},
]


async def seed_homepage_defaults(db) -> None:
    """Idempotent — inserts each section's defaults only if section is empty.

    Also runs a small in-place migration to hide two legacy trust-indicator
    cards ("Available Across Bengaluru", "Transparent Pricing") that were
    seeded in an earlier release but are no longer part of the 4-card
    homepage layout (Module 1 UI polish, 2026-07-07).
    """
    # ── Legacy hide-migration (idempotent) ─────────────────────────────
    try:
        await db.homepage_blocks.update_many(
            {"section": "trust_indicator",
             "label": {"$in": ["Available Across Bengaluru", "Transparent Pricing"]}},
            {"$set": {"hidden": True}},
        )
    except Exception:                                              # pragma: no cover
        pass

    # ── Construction-process content migration (idempotent) ────────────
    # Existing databases were seeded with the old consultation-led flow
    # (Free Consultation / Site Visit / Quotation ...). Force the approved
    # 8-step business flow content onto the existing docs, matched by order.
    try:
        existing_steps = await db.homepage_blocks.find(
            {"section": "construction_step"}
        ).sort("order", 1).to_list(50)
        old_titles = {b.get("title") for b in existing_steps}
        approved_titles = {s["title"] for s in DEFAULT_CONSTRUCTION_STEPS}
        if existing_steps and old_titles != approved_titles:
            for i, step in enumerate(DEFAULT_CONSTRUCTION_STEPS):
                await db.homepage_blocks.update_one(
                    {"section": "construction_step", "order": i},
                    {"$set": {
                        "title": step["title"],
                        "description": step["description"],
                        "icon": step["icon"],
                        "hidden": False,
                        "updated_at": _now(),
                    }},
                )
            # Remove any stale extra steps beyond the approved 8.
            await db.homepage_blocks.delete_many(
                {"section": "construction_step", "order": {"$gte": len(DEFAULT_CONSTRUCTION_STEPS)}}
            )
            logger.info("Migrated construction_step content to approved 8-step flow")
    except Exception:                                              # pragma: no cover
        pass

    # ── Guarantee + Why-Choose content migration (idempotent) ──────────
    # Replace legacy business messaging (Money Safety / No Delay /
    # Material Marketplace / Construction ERP ...) with the current
    # BDesigner product content. Keyed on the title-set so it runs once.
    for _sec, _items in (("guarantee", DEFAULT_GUARANTEES), ("comparison_feature", DEFAULT_COMPARISON)):
        try:
            _existing = await db.homepage_blocks.find({"section": _sec}).to_list(100)
            if not _existing:
                continue
            _old = {b.get("title") for b in _existing}
            _new = {it.get("title") for it in _items}
            if _old == _new:
                continue
            await db.homepage_blocks.delete_many({"section": _sec})
            _docs = []
            for i, it in enumerate(_items):
                _docs.append({
                    "id": str(uuid.uuid4()),
                    "section": _sec,
                    "title": it.get("title", "") or "",
                    "description": it.get("description", "") or "",
                    "icon": it.get("icon", "") or "",
                    "image_url": it.get("image_url", "") or "",
                    "value": it.get("value", "") or "",
                    "label": it.get("label", "") or "",
                    "link_url": it.get("link_url", "") or "",
                    "meta": it.get("meta") or {},
                    "order": i,
                    "hidden": False,
                    "created_at": _now(),
                    "updated_at": _now(),
                })
            await db.homepage_blocks.insert_many(_docs)
            logger.info("Migrated %s content to current BDesigner product", _sec)
        except Exception:                                          # pragma: no cover
            pass

    seeds = [
        ("trust_indicator",    DEFAULT_TRUST_INDICATORS),
        ("construction_step",  DEFAULT_CONSTRUCTION_STEPS),
        ("guarantee",          DEFAULT_GUARANTEES),
        ("advisor_benefit",    DEFAULT_ADVISOR_BENEFITS),
        ("service_area",       DEFAULT_SERVICE_AREAS),
        ("service_area_region", DEFAULT_SERVICE_AREA_REGIONS),
        ("homeowner_review",   DEFAULT_HOMEOWNER_REVIEWS),
        ("construction_package", DEFAULT_PACKAGES),
        ("comparison_feature", DEFAULT_COMPARISON),
        ("trusted_brand",      DEFAULT_TRUSTED_BRANDS),
        ("faq",                DEFAULT_FAQS),
        ("shop_by_category",   DEFAULT_SHOP_CATEGORIES),
        ("cta_section",        DEFAULT_CTA_SECTION),
    ]
    inserted_total = 0
    for section, items in seeds:
        count = await db.homepage_blocks.count_documents({"section": section})
        if count > 0:
            continue
        docs = []
        for i, it in enumerate(items):
            docs.append({
                "id": str(uuid.uuid4()),
                "section": section,
                "title":       it.get("title", "") or "",
                "description": it.get("description", "") or "",
                "icon":        it.get("icon", "") or "",
                "image_url":   it.get("image_url", "") or "",
                "value":       it.get("value", "") or "",
                "label":       it.get("label", "") or "",
                "link_url":    it.get("link_url", "") or "",
                "meta":        it.get("meta") or {},
                "order": i,
                "hidden": False,
                "created_at": _now(),
                "updated_at": _now(),
            })
        if docs:
            await db.homepage_blocks.insert_many(docs)
            inserted_total += len(docs)
    if inserted_total:
        logger.info("Seeded %d homepage_blocks items", inserted_total)

    # ── Section settings (heading, subtitle, enabled, status) ──────────
    settings_inserted = 0
    for section, defaults in DEFAULT_SECTION_SETTINGS.items():
        existing = await db.homepage_section_settings.find_one({"section": section})
        if existing:
            continue
        await db.homepage_section_settings.insert_one({
            "section": section,
            "heading":  defaults.get("heading", "") or "",
            "subtitle": defaults.get("subtitle", "") or "",
            "enabled": True,
            "status": "published",
            "updated_at": _now(),
            "updated_by_id": None,
            "updated_by_name": "system",
        })
        settings_inserted += 1
    if settings_inserted:
        logger.info("Seeded %d homepage_section_settings docs", settings_inserted)


# ───────────────────────────────────────────────────────────────────────
# Router
# ───────────────────────────────────────────────────────────────────────
def build_homepage_router(
    *,
    api_router: APIRouter,
    db,
    require_admin,
    crm_record_activity=None,
    crm_next_id=None,
):
    """Mount homepage CMS + public lead endpoints on the given api_router.

    `crm_record_activity` and `crm_next_id` are callables exposed by crm.py
    so the public-lead endpoint can reuse the existing activity log and
    sequence generator.
    """

    # ── Public ──────────────────────────────────────────────────────────
    @api_router.get("/homepage/sections")
    async def public_homepage_sections():
        out = {s: [] for s in VALID_SECTIONS}
        rows = await db.homepage_blocks.find(
            {"hidden": {"$ne": True}},
            {"_id": 0},
        ).sort([("section", 1), ("order", 1)]).to_list(2000)
        for r in rows:
            sec = r.get("section")
            if sec in out:
                out[sec].append(r)
        # Also expose section-level settings (heading, subtitle,
        # enabled, status) so the public homepage can render section
        # titles and hide entire sections when the admin disables them.
        settings_rows = await db.homepage_section_settings.find(
            {}, {"_id": 0},
        ).to_list(200)
        settings_map = {s.get("section"): s for s in settings_rows if s.get("section")}
        return {**out, "_settings": settings_map}

    @api_router.post("/crm/public-lead")
    async def public_lead(payload: PublicLeadIn):
        # [DEPRECATED — Phase 2A] Legacy CRM v1 public lead → writes to
        # `crm_leads`. Superseded by POST /api/erp/enquiries. No live frontend
        # caller. Kept for backwards compatibility; do not use in new dev.
        name = (payload.full_name or "").strip()
        mobile = (payload.mobile or "").strip()
        if not name:
            raise HTTPException(status_code=400, detail="Please enter your name")
        if not mobile or len(mobile.replace(" ", "")) < 7:
            raise HTTPException(status_code=400, detail="Please enter a valid phone number")

        crm_id = None
        if callable(crm_next_id):
            try:
                crm_id = await crm_next_id(db)
            except Exception as e:                              # pragma: no cover
                logger.warning("crm_next_id failed: %s", e)

        # NEW (Fix 9): pull service-area / main-area labels out of meta so
        # they land in the dedicated CRM columns instead of being lost.
        pmeta = payload.meta or {}
        service_area_label = (pmeta.get("service_area_label") or "").strip()
        main_area_label = (pmeta.get("main_area_label") or "").strip()
        # Backwards-compat: legacy compact modal still posts `city` as a
        # single joined string ("Whitefield, Bengaluru"). If the new
        # cascading meta is present, service_area_label wins for `city`.
        city_val = service_area_label or (payload.city or "").strip() or None

        doc = {
            "id": str(uuid.uuid4()),
            "crm_id": crm_id or f"WEB-{uuid.uuid4().hex[:8].upper()}",
            "full_name": name,
            "mobile": mobile,
            "alternate_mobile": None,
            "email": None,
            "city": city_val,
            "area": main_area_label or None,
            "locality": None,
            "plot_address": None,
            "plot_size": (payload.plot_size or "").strip() or None,
            "builtup_area": None,
            "floors": None,
            "budget": (payload.budget or "").strip() or None,
            "timeline": (payload.start_date or "").strip() or None,
            "construction_stage": None,
            "services": [],
            "lead_source": f"homepage:{(payload.source or 'unknown').strip()[:64]}",
            "notes": (payload.notes or "").strip() or None,
            "assigned_staff_id": None,
            "assigned_staff_name": None,
            "status": "new",
            "created_at": _now(),
            "updated_at": _now(),
            "created_by_id": None,
            "created_by_name": "Homepage Form",
            # Persist the raw meta blob so admin CRM can display the exact
            # region/area IDs the user selected — helpful for reporting.
            "meta": pmeta or None,
        }
        await db.crm_leads.insert_one(doc.copy())

        # ── NEW: Mirror into CRM v2 (ERP) so the lead shows up in
        # /erp/crm/leads, the dashboard counters, activity feed and
        # notifications — as required by the "Lead Creation & Notification
        # Flow" spec. Any failure here is logged but does NOT break the
        # public form (the legacy crm_leads doc is already persisted).
        # NOTE: CRM v2 mirror + notifications intentionally removed for
        # the ERP rebuild. Only the legacy `crm_leads` doc + optional
        # activity log survive. Rebuild will re-introduce the mirror.
        crm2_project_id = None
        crm2_project_hid = None
        crm2_duplicate = False
        # ────────────────────────────────────────────────────────────

        if callable(crm_record_activity):
            try:
                await crm_record_activity(
                    db,
                    lead_id=doc["id"],
                    event_type="lead_created",
                    message=f"Lead created via homepage ({doc['lead_source']})",
                    actor={"id": None, "name": "Homepage Form"},
                    meta={"source": payload.source, "crm_id": doc["crm_id"]},
                )
            except Exception as e:                              # pragma: no cover
                logger.warning("activity log failed: %s", e)

        return {
            "ok": True,
            "id": doc["id"],
            "crm_id": doc["crm_id"],
            "crm2_project_id": crm2_project_id,
            "crm2_project_ref": crm2_project_hid,
            "duplicate": crm2_duplicate,
            "message": (
                "We already have your enquiry from the last 24 hours — our team will call you shortly."
                if crm2_duplicate
                else "Thanks! Our team will reach out to you shortly."
            ),
        }

    # ── Admin ───────────────────────────────────────────────────────────
    @api_router.get("/admin/homepage/items")
    async def admin_list_items(
        section: Optional[str] = None,
        user: dict = Depends(require_admin),
    ):
        q: dict = {}
        if section:
            if section not in VALID_SECTIONS:
                raise HTTPException(status_code=400, detail=f"Invalid section. Must be one of {VALID_SECTIONS}.")
            q["section"] = section
        rows = await db.homepage_blocks.find(q, {"_id": 0}).sort([("section", 1), ("order", 1)]).to_list(2000)
        return {"items": rows}

    @api_router.post("/admin/homepage/items")
    async def admin_create_item(payload: HomepageItemIn, user: dict = Depends(require_admin)):
        section = (payload.section or "").strip()
        if section not in VALID_SECTIONS:
            raise HTTPException(status_code=400, detail=f"Invalid section. Must be one of {VALID_SECTIONS}.")
        # Auto-increment order if not provided
        order = payload.order
        if order is None:
            last = await db.homepage_blocks.find_one(
                {"section": section}, sort=[("order", -1)], projection={"order": 1}
            )
            order = ((last or {}).get("order") or 0) + 1
        actor_id = (user or {}).get("id")
        actor_name = (user or {}).get("full_name") or (user or {}).get("email") or "admin"
        doc = {
            "id": str(uuid.uuid4()),
            "section": section,
            "title":       (payload.title or "").strip(),
            "description": (payload.description or "").strip(),
            "icon":        (payload.icon or "").strip(),
            "image_url":   (payload.image_url or "").strip(),
            "value":       (payload.value or "").strip(),
            "label":       (payload.label or "").strip(),
            "link_url":    (payload.link_url or "").strip(),
            "meta":        payload.meta or {},
            "order": int(order or 0),
            "hidden": bool(payload.hidden or False),
            "created_at": _now(),
            "updated_at": _now(),
            "updated_by_id": actor_id,
            "updated_by_name": actor_name,
        }
        await db.homepage_blocks.insert_one(doc.copy())
        # Refresh section-level updated_at / updated_by so the section
        # card can show "Last updated N minutes ago by X".
        await _touch_section(db, section, actor_id, actor_name)
        return _strip(doc)

    @api_router.patch("/admin/homepage/items/{item_id}")
    async def admin_update_item(item_id: str, payload: HomepageItemUpdate, user: dict = Depends(require_admin)):
        existing = await db.homepage_blocks.find_one({"id": item_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Item not found")
        actor_id = (user or {}).get("id")
        actor_name = (user or {}).get("full_name") or (user or {}).get("email") or "admin"
        patch: dict = {
            "updated_at": _now(),
            "updated_by_id": actor_id,
            "updated_by_name": actor_name,
        }
        for f in ("title", "description", "icon", "image_url", "value", "label", "link_url"):
            v = getattr(payload, f)
            if v is not None:
                patch[f] = (v or "").strip()
        if payload.meta is not None:
            patch["meta"] = payload.meta or {}
        if payload.order is not None:
            patch["order"] = int(payload.order)
        if payload.hidden is not None:
            patch["hidden"] = bool(payload.hidden)
        await db.homepage_blocks.update_one({"id": item_id}, {"$set": patch})
        await _touch_section(db, existing.get("section") or "", actor_id, actor_name)
        return await db.homepage_blocks.find_one({"id": item_id}, {"_id": 0})

    @api_router.delete("/admin/homepage/items/{item_id}")
    async def admin_delete_item(item_id: str, user: dict = Depends(require_admin)):
        existing = await db.homepage_blocks.find_one({"id": item_id}, {"_id": 0, "section": 1})
        res = await db.homepage_blocks.delete_one({"id": item_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        actor_id = (user or {}).get("id")
        actor_name = (user or {}).get("full_name") or (user or {}).get("email") or "admin"
        await _touch_section(db, (existing or {}).get("section") or "", actor_id, actor_name)
        return {"ok": True}

    @api_router.post("/admin/homepage/items/reorder")
    async def admin_reorder(payload: ReorderIn, user: dict = Depends(require_admin)):
        section = (payload.section or "").strip()
        if section not in VALID_SECTIONS:
            raise HTTPException(status_code=400, detail=f"Invalid section. Must be one of {VALID_SECTIONS}.")
        ids = list(payload.ids or [])
        for i, item_id in enumerate(ids):
            await db.homepage_blocks.update_one(
                {"id": item_id, "section": section},
                {"$set": {"order": i, "updated_at": _now()}},
            )
        actor_id = (user or {}).get("id")
        actor_name = (user or {}).get("full_name") or (user or {}).get("email") or "admin"
        await _touch_section(db, section, actor_id, actor_name)
        return {"ok": True, "count": len(ids)}

    # ── Admin: section-level settings ───────────────────────────────────
    ALL_SETTINGS_SECTIONS = tuple(list(VALID_SECTIONS) + ["hero_banner", "trending_materials"])

    @api_router.get("/admin/homepage/sections/settings")
    async def admin_list_section_settings(user: dict = Depends(require_admin)):
        rows = await db.homepage_section_settings.find({}, {"_id": 0}).to_list(200)
        by_section = {r.get("section"): r for r in rows if r.get("section")}
        # Fill in defaults for any missing section so the UI always has
        # a settings doc to render (idempotent, no DB write).
        out = {}
        for s in ALL_SETTINGS_SECTIONS:
            existing = by_section.get(s)
            if existing:
                out[s] = existing
            else:
                defaults = DEFAULT_SECTION_SETTINGS.get(s, {})
                out[s] = {
                    "section": s,
                    "heading":  defaults.get("heading", "") or "",
                    "subtitle": defaults.get("subtitle", "") or "",
                    "enabled": True,
                    "status": "published",
                    "updated_at": None,
                    "updated_by_id": None,
                    "updated_by_name": None,
                }
        return {"settings": out}

    @api_router.patch("/admin/homepage/sections/settings/{section}")
    async def admin_update_section_settings(
        section: str,
        payload: SectionSettingsIn,
        user: dict = Depends(require_admin),
    ):
        section = (section or "").strip()
        if section not in ALL_SETTINGS_SECTIONS:
            raise HTTPException(status_code=400, detail=f"Invalid section. Must be one of {ALL_SETTINGS_SECTIONS}.")
        patch: dict = {"updated_at": _now()}
        actor_id = (user or {}).get("id")
        actor_name = (user or {}).get("full_name") or (user or {}).get("email") or "admin"
        patch["updated_by_id"] = actor_id
        patch["updated_by_name"] = actor_name
        if payload.heading is not None:
            patch["heading"] = (payload.heading or "").strip()
        if payload.subtitle is not None:
            patch["subtitle"] = (payload.subtitle or "").strip()
        if payload.enabled is not None:
            patch["enabled"] = bool(payload.enabled)
        if payload.status is not None:
            st = (payload.status or "").strip().lower()
            if st not in ("published", "draft"):
                raise HTTPException(status_code=400, detail="status must be 'published' or 'draft'")
            patch["status"] = st
        if payload.meta is not None:
            patch["meta"] = payload.meta or {}
        await db.homepage_section_settings.update_one(
            {"section": section},
            {
                "$set": patch,
                "$setOnInsert": {"section": section},
            },
            upsert=True,
        )
        return await db.homepage_section_settings.find_one({"section": section}, {"_id": 0})
