import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarPlus,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Tag,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { SaveButton } from "@/components/SaveButton";
import { CoverImage } from "@/components/CoverImage";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate, formatPrice, formatTime, isFamilyEvent } from "@/lib/events";
import { downloadIcs } from "@/lib/ics";
import { useEvent } from "@/lib/use-events";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event details — Abuja Happenings" },
      {
        name: "description",
        content:
          "Full details for this Abuja event: date, time, venue, price and an add-to-calendar link.",
      },
      { property: "og:title", content: "Event details — Abuja Happenings" },
      {
        property: "og:description",
        content: "See the full details and add this Abuja event to your calendar.",
      },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const { data: event, isLoading } = useEvent(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-80 w-full rounded-[var(--radius-2xl)]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl">We couldn't find that event</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed.</p>
        <Link to="/events" search={{ family: false }} className="mt-6 inline-block font-bold text-primary hover:underline">
          Back to all events
        </Link>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — share it with a friend!");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/events" search={{ family: false }} className="text-sm font-bold text-primary hover:underline">
        ← All events
      </Link>

      <div className="surface-card mt-4 overflow-hidden">
        <CoverImage path={event.cover_image_path} alt={event.name} className="h-72 w-full" />

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-primary text-primary-foreground capitalize">
              {event.category}
            </Badge>
            <Badge className="rounded-full bg-sage text-sage-foreground capitalize">
              {event.age_suitability}
            </Badge>
            {isFamilyEvent(event) && (
              <Badge className="rounded-full bg-gold text-gold-foreground">Family friendly</Badge>
            )}
          </div>

          <div>
            <h1 className="text-3xl leading-tight">{event.name}</h1>
            <p className="mt-2 text-lg font-bold text-primary">
              {formatLongDate(event.event_date)}
            </p>
          </div>

          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {event.description}
          </p>

          <dl className="grid gap-4 rounded-2xl bg-cream p-5 sm:grid-cols-2">
            <Detail icon={<Clock className="h-4 w-4" />} label="Time">
              {formatTime(event.start_time)}
              {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
            </Detail>
            <Detail icon={<MapPin className="h-4 w-4" />} label="Location">
              {event.venue_name}
              {event.address ? `, ${event.address}` : ""} ({event.area})
            </Detail>
            <Detail icon={<Tag className="h-4 w-4" />} label="Price">
              {formatPrice(event)}
            </Detail>
            <Detail icon={<Users className="h-4 w-4" />} label="Suitable for">
              <span className="capitalize">{event.age_suitability}</span>
            </Detail>
            <Detail icon={<User className="h-4 w-4" />} label="Organiser">
              {event.organizer_name}
              {event.organizer_contact ? ` · ${event.organizer_contact}` : ""}
            </Detail>
          </dl>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadIcs(event)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar
            </button>
            <SaveButton eventId={event.id} />
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-3 font-bold transition-colors hover:bg-accent"
            >
              <Share2 className="h-4 w-4" aria-hidden /> Share
            </button>
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-bold text-gold-foreground transition-transform hover:-translate-y-0.5"
              >
                <ExternalLink className="h-4 w-4" aria-hidden /> Tickets &amp; RSVP
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  );
}
