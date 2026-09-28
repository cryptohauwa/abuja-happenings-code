import type { Tables } from "@/integrations/supabase/types";

export type EventRow = Tables<"events">;

export const CATEGORIES = [
  "music",
  "food",
  "networking",
  "workshop",
  "party",
  "market",
  "sports",
  "arts",
  "religious",
  "family/kids",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const AGE_OPTIONS = [
  "all ages",
  "family-friendly",
  "adults only",
  "kids only",
] as const;

export const AREAS = [
  "Central District (Three Arms Zone / Area 10)",
  "Garki",
  "Wuse",
  "Wuse 2",
  "Maitama",
  "Asokoro",
  "Utako",
  "Jabi",
  "Gwarinpa",
  "Kado",
  "Durumi",
  "Gudu",
  "Mabuchi",
  "Katampe",
  "Wuye",
  "Nyanya",
  "Karu",
  "Kubwa",
  "Lugbe",
  "Gwagwalada",
  "Dei-Dei",
  "Mpape",
  "Other",
] as const;

export const FAMILY_FRIENDLY_AGES = ["family-friendly", "kids only", "all ages"];

export function isFamilyEvent(event: EventRow) {
  return (
    event.category === "family/kids" ||
    event.age_suitability === "family-friendly" ||
    event.age_suitability === "kids only"
  );
}

export function eventStart(event: EventRow) {
  return new Date(`${event.event_date}T${(event.start_time ?? "00:00:00").slice(0, 8)}`);
}

export function eventEnd(event: EventRow) {
  if (!event.end_time) {
    const start = eventStart(event);
    return new Date(start.getTime() + 2 * 60 * 60 * 1000);
  }
  return new Date(`${event.event_date}T${event.end_time.slice(0, 8)}`);
}

export function formatTime(value: string | null) {
  if (!value) return "";
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m}${suffix}`;
}

export function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatLongDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPrice(event: EventRow) {
  if (event.is_free || !event.price) return "Free";
  return `₦${Number(event.price).toLocaleString("en-NG")}`;
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export type DateRangeKey = "any" | "today" | "weekend" | "week" | "month";

export function dateRangeBounds(key: DateRangeKey): [string, string] | null {
  if (key === "any") return null;
  const today = new Date(`${todayISO()}T12:00:00`);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  if (key === "today") return [iso(today), iso(today)];

  if (key === "weekend") {
    const day = today.getDay();
    const daysToSat = (6 - day + 7) % 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysToSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return [iso(sat), iso(sun)];
  }

  const end = new Date(today);
  end.setDate(today.getDate() + (key === "week" ? 7 : 30));
  return [iso(today), iso(end)];
}
