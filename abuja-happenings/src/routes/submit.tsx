import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AGE_OPTIONS, AREAS, CATEGORIES } from "@/lib/events";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Post an event — Abuja Happenings" },
      {
        name: "description",
        content:
          "Share an event happening around Abuja: add the venue, date, time, price and a cover photo so the whole city can find it.",
      },
      { property: "og:title", content: "Post an event in Abuja" },
      {
        property: "og:description",
        content: "Add your Abuja event to the community board in a couple of minutes.",
      },
    ],
  }),
  component: SubmitPage,
});

const fieldClass =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SubmitPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

    setSaving(true);
    try {
      let coverPath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("event-covers")
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        coverPath = path;
      }

      const { data, error } = await supabase
        .from("events")
        .insert({
          name: value("name"),
          description: value("description"),
          cover_image_path: coverPath,
          category: value("category"),
          age_suitability: value("age_suitability"),
          venue_name: value("venue_name"),
          area: value("area"),
          address: value("address"),
          event_date: value("event_date"),
          start_time: value("start_time"),
          end_time: value("end_time") || null,
          is_free: isFree,
          price: isFree ? null : Number(value("price") || 0),
          organizer_name: value("organizer_name"),
          organizer_contact: value("organizer_contact"),
          ticket_url: value("ticket_url") || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      toast.success("Your event is live on the board!");
      navigate({ to: "/events/$id", params: { id: data.id } });
    } catch (error) {
      console.error(error);
      toast.error("We couldn't post that event. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">Post an event</h1>
      <p className="mt-2 text-muted-foreground">
        Tell your neighbours what's happening. Everything you add shows up on the public board.
      </p>

      <form onSubmit={onSubmit} className="surface-card mt-6 space-y-6 p-6 sm:p-8">
        <Field label="Event name" htmlFor="name">
          <Input id="name" name="name" required className={fieldClass} placeholder="Sunset Live" />
        </Field>

        <Field label="Cover photo" htmlFor="cover" hint="Optional, up to 10MB">
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-dashed border-input bg-background p-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-bold file:text-primary-foreground"
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            className="rounded-2xl"
            placeholder="What should people expect?"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <select id="category" name="category" className={fieldClass} defaultValue="other">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Age suitability" htmlFor="age_suitability">
            <select
              id="age_suitability"
              name="age_suitability"
              className={fieldClass}
              defaultValue="all ages"
            >
              {AGE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Venue name" htmlFor="venue_name">
            <Input id="venue_name" name="venue_name" required className={fieldClass} />
          </Field>
          <Field label="Area of Abuja" htmlFor="area">
            <select id="area" name="area" className={fieldClass} defaultValue="Wuse">
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Street address" htmlFor="address">
          <Input id="address" name="address" className={fieldClass} placeholder="14 Aminu Kano Crescent" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Date" htmlFor="event_date">
            <Input id="event_date" name="event_date" type="date" required className={fieldClass} />
          </Field>
          <Field label="Start time" htmlFor="start_time">
            <Input id="start_time" name="start_time" type="time" required className={fieldClass} />
          </Field>
          <Field label="End time" htmlFor="end_time">
            <Input id="end_time" name="end_time" type="time" className={fieldClass} />
          </Field>
        </div>

        <div className="rounded-2xl bg-cream p-5">
          <div className="flex items-center gap-3">
            <Switch id="free" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="free" className="font-bold">
              This event is free
            </Label>
          </div>
          {!isFree && (
            <div className="mt-4">
              <Label htmlFor="price" className="font-bold">
                Price (₦)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="100"
                className={`${fieldClass} mt-2`}
              />
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Organiser name" htmlFor="organizer_name">
            <Input id="organizer_name" name="organizer_name" required className={fieldClass} />
          </Field>
          <Field label="Organiser contact" htmlFor="organizer_contact" hint="Phone or email">
            <Input id="organizer_contact" name="organizer_contact" className={fieldClass} />
          </Field>
        </div>

        <Field label="Ticket or RSVP link" htmlFor="ticket_url" hint="Optional">
          <Input
            id="ticket_url"
            name="ticket_url"
            type="url"
            className={fieldClass}
            placeholder="https://"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? "Posting…" : "Post event to the board"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="font-bold">
        {label}
        {hint ? <span className="ml-2 font-normal text-muted-foreground">{hint}</span> : null}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
