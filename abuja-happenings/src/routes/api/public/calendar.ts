import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { buildIcs } from "@/lib/ics";

export const Route = createFileRoute("/api/public/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");

        const supabaseUrl =
          process.env["VITE_SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
        const supabaseKey =
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
          import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

        const supabase = createClient(supabaseUrl as string, supabaseKey as string, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        let query = supabase
          .from("events")
          .select(
            "id,name,description,venue_name,area,address,event_date,start_time,end_time,category",
          )
          .order("event_date", { ascending: true });

        if (category) query = query.eq("category", category);

        const { data, error } = await query;
        if (error) {
          return new Response("Could not load events", { status: 500 });
        }

        const ics = buildIcs(
          data ?? [],
          category ? `Abuja Happenings — ${category}` : "Abuja Happenings",
        );

        return new Response(ics, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
