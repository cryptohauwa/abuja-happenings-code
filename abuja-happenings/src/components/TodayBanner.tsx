import { Link } from "@tanstack/react-router";
import { CalendarHeart, X } from "lucide-react";
import { useEffect, useState } from "react";

import { formatTime, todayISO } from "@/lib/events";
import { useSavedEvents } from "@/lib/use-saved";

const KEY = "today-banner-dismissed";

export function TodayBanner() {
  const { data } = useSavedEvents();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(KEY) === todayISO());
  }, []);

  const today = (data ?? []).filter((e) => e.event_date === todayISO());
  if (dismissed || today.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="relative flex gap-3 rounded-2xl border border-gold/60 bg-gold/20 p-4 pr-12 shadow-[var(--shadow-soft)]">
        <CalendarHeart className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0">
          <p className="font-display font-bold">
            {today.length === 1 ? "You have an event today" : `You have ${today.length} events today`}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {today.map((e) => (
              <li key={e.id}>
                <Link
                  to="/events/$id"
                  params={{ id: e.id }}
                  className="font-bold text-foreground hover:underline"
                >
                  {e.name}
                </Link>{" "}
                <span className="text-muted-foreground">
                  at {formatTime(e.start_time)}, {e.venue_name}, {e.area}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          aria-label="Dismiss reminder"
          onClick={() => {
            sessionStorage.setItem(KEY, todayISO());
            setDismissed(true);
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-gold/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
