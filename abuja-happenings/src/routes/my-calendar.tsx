import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import { TodayBanner } from "@/components/TodayBanner";
import { formatLongDate, formatTime, todayISO, type EventRow } from "@/lib/events";
import { useAuth } from "@/lib/use-auth";
import { useSavedEvents } from "@/lib/use-saved";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-calendar")({
  head: () => ({
    meta: [
      { title: "My calendar — Abuja Happenings" },
      { name: "description", content: "Your saved Abuja events on a month calendar." },
      { property: "og:title", content: "My calendar — Abuja Happenings" },
      { property: "og:description", content: "See the Abuja events you've saved, month by month." },
    ],
  }),
  component: MyCalendar,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

function MyCalendar() {
  const { user, ready } = useAuth();
  const { data: events = [], isLoading } = useSavedEvents();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string>(todayISO());

  const byDate = useMemo(() => {
    const m = new Map<string, EventRow[]>();
    for (const e of events) m.set(e.event_date, [...(m.get(e.event_date) ?? []), e]);
    return m;
  }, [events]);

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl">Your personal calendar</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to save events and see them here on a calendar.
        </p>
        <Link to="/auth" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const base = new Date(`${todayISO()}T12:00:00`);
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const selectedEvents = byDate.get(selected) ?? [];

  return (
    <div className="pb-10">
      <TodayBanner />
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <h1 className="text-3xl">My calendar</h1>
        <p className="mt-2 text-muted-foreground">
          Events you've saved. Tap a date with a dot to see what's on.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button aria-label="Previous month" onClick={() => setOffset(offset - 1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg">
                {first.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
              </h2>
              <button aria-label="Next month" onClick={() => setOffset(offset + 1)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-muted-foreground">
              {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
                const has = byDate.has(iso);
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold transition-colors",
                      iso === selected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                      iso === todayISO() && iso !== selected && "ring-2 ring-gold",
                    )}
                  >
                    {day}
                    {has && (
                      <span className={cn("mt-1 h-1.5 w-1.5 rounded-full", iso === selected ? "bg-primary-foreground" : "bg-primary")} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="surface-card p-5">
            <h2 className="text-lg">{formatLongDate(selected)}</h2>
            {isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            ) : selectedEvents.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing saved for this day.{" "}
                <Link to="/events" search={{ family: false }} className="font-bold text-primary hover:underline">
                  Browse events
                </Link>
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {selectedEvents.map((e) => (
                  <li key={e.id} className="rounded-2xl bg-cream p-4">
                    <Link to="/events/$id" params={{ id: e.id }} className="font-display font-bold hover:underline">
                      {e.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" /> {formatTime(e.start_time)}
                      {e.end_time ? ` – ${formatTime(e.end_time)}` : ""}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" /> {e.venue_name}, {e.area}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
