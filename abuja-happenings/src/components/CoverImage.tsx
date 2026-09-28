import { useQuery } from "@tanstack/react-query";
import { CalendarHeart } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function useCoverUrl(path: string | null) {
  return useQuery({
    queryKey: ["cover", path],
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("event-covers")
        .createSignedUrl(path!, 60 * 60 * 24 * 7);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function CoverImage({
  path,
  alt,
  className,
}: {
  path: string | null;
  alt: string;
  className?: string;
}) {
  const { data: url } = useCoverUrl(path);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-accent text-accent-foreground",
          className,
        )}
      >
        <CalendarHeart className="h-10 w-10 opacity-50" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return <img src={url} alt={alt} className={cn("object-cover", className)} loading="lazy" />;
}
