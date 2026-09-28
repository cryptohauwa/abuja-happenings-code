import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CATEGORIES } from "@/lib/events";

export const Route = createFileRoute("/calendar-feeds")({
  head: () => ({
    meta: [
      { title: "Subscribe to Abuja events — Abuja Happenings" },
      {
        name: "description",
        content:
          "Subscribe once and new Abuja events appear in your Google, Apple or Outlook calendar automatically. Subscribe to everything or just one category.",
      },
      { property: "og:title", content: "Subscribe to Abuja events" },
      {
        property: "og:description",
        content: "Get every new Abuja event in your own calendar, automatically.",
      },
    ],
  }),
  component: CalendarFeeds,
});

function CalendarFeeds() {
  const [origin, setOrigin] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => setOrigin(window.location.origin), []);

  const feedUrl =
    origin +
    "/api/public/calendar" +
    (category === "all" ? "" : `?category=${encodeURIComponent(category)}`);

  const copy = async () => {
    await navigator.clipboard.writeText(feedUrl);
    toast.success("Feed link copied");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Subscribe to Abuja events</h1>
      <p className="mt-2 text-muted-foreground">
        Add this link once and every new event on the board shows up in your own calendar —
        Google, Apple or Outlook.
      </p>

      <div className="surface-card mt-6 space-y-5 p-6">
        <div>
          <label htmlFor="cat" className="font-bold">
            What would you like to follow?
          </label>
          <select
            id="cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-semibold"
          >
            <option value="all">Everything happening in Abuja</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Only {c} events
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-cream p-4">
          <p className="break-all font-mono text-sm">{feedUrl || "Loading…"}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            <Copy className="h-4 w-4" aria-hidden /> Copy feed link
          </button>
          <a
            href={feedUrl}
            className="inline-flex items-center gap-2 rounded-full border border-input px-5 py-3 font-bold hover:bg-accent"
          >
            Download as .ics
          </a>
        </div>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Copy the link above.</li>
          <li>
            In Google Calendar: Other calendars → From URL. In Apple Calendar: File → New Calendar
            Subscription. In Outlook: Add calendar → Subscribe from web.
          </li>
          <li>Paste the link and save — new events arrive on their own.</li>
        </ol>
      </div>
    </div>
  );
}
