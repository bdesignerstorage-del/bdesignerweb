import api from "@/lib/api";

/** Fire-and-forget tracking (won't block UI on failure). */
export function track(entity_type, entity_id, action, destination) {
  try {
    api.post("/track", { entity_type, entity_id, action, destination }).catch(() => {});
  } catch {}
}
