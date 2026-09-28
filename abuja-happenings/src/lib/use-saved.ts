import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { EventRow } from "@/lib/events";
import { useAuth } from "@/lib/use-auth";

export function useSavedEvents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-events", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<EventRow[]> => {
      const { data, error } = await supabase
        .from("saved_events")
        .select("event:events(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? [])
        .map((r) => r.event as EventRow | null)
        .filter((e): e is EventRow => !!e)
        .sort((a, b) =>
          `${a.event_date}${a.start_time}`.localeCompare(`${b.event_date}${b.start_time}`),
        );
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, saved }: { eventId: string; saved: boolean }) => {
      if (!user) throw new Error("not signed in");
      if (saved) {
        const { error } = await supabase
          .from("saved_events")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", eventId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_events")
          .insert({ user_id: user.id, event_id: eventId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-events"] }),
  });
}
