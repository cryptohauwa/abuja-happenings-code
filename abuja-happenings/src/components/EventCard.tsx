import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";

import { SaveButton } from "@/components/SaveButton";
import { CoverImage } from "@/components/CoverImage";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, formatTime, isFamilyEvent, type EventRow } from "@/lib/events";

export function EventCard({ event }: { event: EventRow }) {
  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="surface-card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <CoverImage
          path={event.cover_image_path}
          alt={event.name}
          className="h-44 w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="rounded-full bg-primary text-primary-foreground capitalize">
            {event.category}
          </Badge>
          {isFamilyEvent(event) && (
            <Badge className="rounded-full bg-sage text-sage-foreground">Family friendly</Badge>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
          {formatPrice(event)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-bold text-primary">{formatDate(event.event_date)}</p>
        <h3 className="text-lg leading-snug">{event.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="mt-auto space-y-1 pt-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            {formatTime(event.start_time)}
            {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {event.venue_name}, {event.area}
          </p>
        </div>
        <div className="pt-3">
          <SaveButton eventId={event.id} compact />
        </div>
      </div>
    </Link>
  );
}
