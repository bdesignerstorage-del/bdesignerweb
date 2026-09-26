// Map admin-editable icon strings → lucide-react components.
// Keep the set small and on-brand. Unknown names fall back to Sparkles.
import {
  Layers, BadgeCheck, Package, Star, MapPin, ShieldCheck,
  FileText, PhoneCall, FileSpreadsheet, FileCheck, Calendar, HardHat, Key,
  BadgeIndianRupee, Clock, UserCheck, ScrollText,
  Wallet, Calculator, PackageSearch, CalendarClock, Map,
  Sparkles, Hammer, Building2, Ruler, PaintBucket, Zap, Droplet, TreePine,
  Users, PencilRuler, Sun, Sunrise, Moon, CloudSun,
} from "lucide-react";

const MAP = {
  Layers, BadgeCheck, Package, Star, MapPin, ShieldCheck,
  FileText, PhoneCall, FileSpreadsheet, FileCheck, Calendar, HardHat, Key,
  BadgeIndianRupee, Clock, UserCheck, ScrollText,
  Wallet, Calculator, PackageSearch, CalendarClock, Map,
  Sparkles, Hammer, Building2, Ruler, PaintBucket, Zap, Droplet, TreePine,
  Users, PencilRuler, Sun, Sunrise, Moon, CloudSun,
};

export const ICON_NAMES = Object.keys(MAP);

export default function getIcon(name) {
  return MAP[name] || Sparkles;
}
