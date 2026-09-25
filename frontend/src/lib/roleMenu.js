/**
 * roleMenu.js — Avatar dropdown items for the public marketplace Navbar.
 *
 * Phase 1 Refinement (2025-07-16): a single unified experience across
 * every role. The dropdown always shows just two actions (My Dashboard,
 * Profile Settings) — Logout is rendered separately by the Navbar.
 */
import { LayoutDashboard, Settings } from "lucide-react";

const DASHBOARD_URL = {
  admin:            "/admin/dashboard",
  project_manager:  "/pm/dashboard",
  civil_engineer:   "/engineer/dashboard",
  client:           "/client/dashboard",
  customer:         "/client/dashboard",
  brand_partner:    "/brand/dashboard",
  brand:            "/brand/dashboard",
};

const SETTINGS_URL = {
  admin:            "/admin/settings",
  project_manager:  "/pm/settings",
  civil_engineer:   "/engineer/settings",
  client:           "/client/settings",
  customer:         "/profile",
  brand_partner:    "/profile",
  brand:            "/profile",
};

export function profileMenuForRole(role) {
  return [
    { label: "My Dashboard",     to: DASHBOARD_URL[role] || "/",       icon: LayoutDashboard, testid: "menu-dashboard", highlight: true },
    { label: "Profile Settings", to: SETTINGS_URL[role]  || "/profile", icon: Settings,        testid: "menu-settings" },
  ];
}

export function displayRoleLabel(role) {
  const map = {
    admin: "Admin",
    project_manager: "Project Manager",
    civil_engineer: "Civil Engineer",
    house_owner: "House Owner",
    brand: "Brand Partner",
    brand_partner: "Brand Partner",
    team_member: "Team Member",
    client: "Client",
    customer: "House Owner",
    user: "House Owner",
  };
  return map[role] || (role || "Guest").replace(/_/g, " ");
}
