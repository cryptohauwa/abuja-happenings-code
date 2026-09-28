import { useNavigate } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/use-auth";
import { useSavedEvents, useToggleSave } from "@/lib/use-saved";
import { cn } from "@/lib/utils";

export function SaveButton({ eventId, compact = false }: { eventId: string; compact?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: saved } = useSavedEvents();
  const toggle = useToggleSave();
  const isSaved = !!saved?.some((e) => e.id === eventId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sign in to save events to your calendar");
      navigate({ to: "/auth" });
      return;
    }
    toggle.mutate(
      { eventId, saved: isSaved },
      {
        onSuccess: () =>
          toast.success(isSaved ? "Removed from My Events" : "Saved to My Events"),
        onError: () => toast.error("Couldn't update My Events. Please try again."),
      },
    );
  };

  const Icon = isSaved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={toggle.isPending}
      aria-pressed={isSaved}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:opacity-60",
        compact ? "h-10 px-4 text-sm" : "px-5 py-3",
        isSaved
          ? "bg-sage text-sage-foreground"
          : "border border-input bg-background text-foreground hover:bg-accent",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {isSaved ? "Saved" : "Save to My Events"}
    </button>
  );
}
