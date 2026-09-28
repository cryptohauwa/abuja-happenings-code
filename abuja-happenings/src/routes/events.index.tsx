import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, LayoutGrid, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AREAS,
  CATEGORIES,
  dateRangeBounds,
  formatTime,
  isFamilyEvent,
  type DateRangeKey,
  type EventRow,
} from "@/lib/events";
import { useUpcomingEvents } from "@/lib/use-events";
import { cn } from "@/lib/utils";

type EventsSearch = { family: boolean };

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    family: search["family"] === true || search["family"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Browse events in Abuja — Abuja Happenings" },
      {
        name: "description",
        content:
          "Search upcoming Abuja events by category, area, date and price. Switch between a list and a calendar view.",
      },
      { property: "og:title", content: "Browse events in Abuja" },
      {
        property: "og:description",
        content: "Find concerts, markets, workshops and family days happening around Abuja.",
      },
    ],
  }),
  component: EventsPage,
});

const selectClass =
  "h-11 w-full rounded-full border border-input bg-card px-4 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function EventsPage() {
  const search = Route.useSearch();
  const { data: events, isLoading } = useUpcomingEvents();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("all");
  const [range, setRange] = useState<DateRangeKey>("any");
  const [price, setPrice] = useState("all");
  const [familyOnly, setFamilyOnly] = useState(Boolean(search.family));
  const [view, setView] = useState<"list" | "calendar">("list");

  const filtered = useMemo(() => {
    const bounds = dateRangeBounds(range);
    const q = query.trim().toLowerCase();

    return (events ?? []).filter((event) => {
      if (category !== "all" && event.category !== category) return false;
      if (area !== "all" && event.area !== area) return false;
      if (price === "free" && !event.is_free) return false;
      if (price === "paid" && event.is_free) return false;
      if (familyOnly && !isFamilyEvent(event)) return false;
      if (bounds && (event.event_date < bounds[0] || event.event_date > bounds[1])) return false;
      if (
        q &&
        !`${event.name} ${event.description} ${event.venue_name} ${event.area} ${event.category} ${event.organizer_name}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [events, category, area, price, familyOnly, range, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Browse events</h1>
      <p className="mt-2 text-muted-foreground">
        Sorted with the soonest first. {filtered.length} event{filtered.length === 1 ? "" : "s"}{" "}
        showing.
      </p>

      <div className="surface-card mt-6 space-y-4 p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, organisers…"
            className="h-12 rounded-full border-input bg-background pl-11 text-base"
            aria-label="Search events"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-label="Area of Abuja"
          >
            <option value="all">All areas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={range}
            onChange={(e) => setRange(e.target.value as DateRangeKey)}
            aria-label="Date range"
          >
            <option value="any">Any date</option>
            <option value="today">Today</option>
            <option value="weekend">This weekend</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
          <select
            className={selectClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-label="Price"
          >
            <option value="all">Free &amp; paid</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch id="family" checked={familyOnly} onCheckedChange={setFamilyOnly} />
            <Label htmlFor="family" className="font-bold">
              Family-friendly only
            </Label>
          </div>

          <div className="flex rounded-full bg-muted p-1">
            {(["list", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize transition-colors",
                  view === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "list" ? (
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                ) : (
                  <CalendarDays className="h-4 w-4" aria-hidden />
                )}
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-[var(--radius-2xl)]" />
          ))}
        </div>
      ) : view === "list" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">
              Nothing matches those filters yet. Try widening your search.
            </p>
          )}
        </div>
      ) : (
        <CalendarView events={filtered} />
      )}
    </div>
  );
}

function CalendarView({ events }: { events: EventRow[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const event of events) {
      const list = map.get(event.event_date) ?? [];
      list.push(event);
      map.set(event.event_date, list);
    }
    return map;
  }, [events]);

  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const cursor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const firstWeekday = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const iso = (day: number) =>
    `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="surface-card mt-8 p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v - 1)}
          className="rounded-full px-4 py-2 text-sm font-bold hover:bg-accent"
        >
          ← Previous
        </button>
        <h2 className="text-xl">
          {cursor.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
        </h2>
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v + 1)}
          className="rounded-full px-4 py-2 text-sm font-bold hover:bg-accent"
        >
          Next →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;
          const dayEvents = grouped.get(iso(day)) ?? [];
          return (
            <div
              key={day}
              className={cn(
                "min-h-24 rounded-2xl border border-border/70 p-2 text-left",
                dayEvents.length ? "bg-accent/50" : "bg-background",
              )}
            >
              <span className="text-xs font-bold text-muted-foreground">{day}</span>
              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <a
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block truncate rounded-lg bg-primary/90 px-2 py-1 text-[11px] font-bold text-primary-foreground"
                    title={`${event.name} · ${formatTime(event.start_time)}`}
                  >
                    {event.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
