import { TodayBanner } from "@/components/TodayBanner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, CalendarPlus, Search } from "lucide-react";

import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { isFamilyEvent } from "@/lib/events";
import { useUpcomingEvents } from "@/lib/use-events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Abuja Happenings — Discover what's happening around Abuja" },
      {
        name: "description",
        content:
          "Never miss out on your city's events, big or small. Browse concerts, markets, workshops and family days around Abuja, or post your own.",
      },
      { property: "og:title", content: "Abuja Happenings" },
      {
        property: "og:description",
        content: "A warm community events board for Abuja — browse what's on or post your own.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: events, isLoading } = useUpcomingEvents();
  const family = (events ?? []).filter(isFamilyEvent).slice(0, 3);
  const soonest = (events ?? []).slice(0, 6);

  return (
    <div>
      <TodayBanner />
      <section className="warm-hero">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
            <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Discover what's happening around Abuja
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Never miss out on your city's events, big or small — from concerts and markets to
              kids' craft mornings and family picnics.
            </p>
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/events"
                search={{ family: false }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
              >
                <Search className="h-4 w-4" aria-hidden /> Browse events
              </Link>
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-gold-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden /> Post an event
              </Link>
            </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl">Coming up soon</h2>
            <p className="text-muted-foreground">The next things happening around the city.</p>
          </div>
          <Link to="/events" search={{ family: false }} className="font-bold text-primary hover:underline">
            See all events →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-[var(--radius-2xl)]" />
            ))}
          {soonest.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {!isLoading && soonest.length === 0 && (
            <p className="text-muted-foreground">
              No events posted yet — be the first to share one.
            </p>
          )}
        </div>
      </section>

      <section className="border-y border-border/70 bg-sage/20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl">
                <Baby className="h-6 w-6 text-primary" aria-hidden /> Family &amp; Kids
              </h2>
              <p className="text-muted-foreground">
                Gentle, welcoming outings the little ones will love.
              </p>
            </div>
            <Link
              to="/events"
              search={{ family: true }}
              className="font-bold text-primary hover:underline"
            >
              All family events →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {family.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {!isLoading && family.length === 0 && (
              <p className="text-muted-foreground">No family events just yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
