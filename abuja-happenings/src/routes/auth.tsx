import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Abuja Happenings" },
      { name: "description", content: "Sign in to save Abuja events to your own calendar." },
      { property: "og:title", content: "Sign in — Abuja Happenings" },
      { property: "og:description", content: "Save events and get a reminder on the day." },
    ],
  }),
  component: AuthPage,
});

const fieldClass = "h-11 rounded-2xl text-base";

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/my-calendar" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in didn't work. Please try again.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl">{mode === "signin" ? "Welcome back" : "Join the board"}</h1>
      <p className="mt-2 text-muted-foreground">
        Save events to your own calendar and see a reminder on the day.
      </p>
      <div className="surface-card mt-6 space-y-5 p-6">
        <button
          type="button"
          onClick={google}
          className="w-full rounded-full border border-input bg-background px-5 py-3 font-bold hover:bg-accent"
        >
          Continue with Google
        </button>
        <div className="text-center text-sm text-muted-foreground">or use email</div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input id="email" name="email" type="email" required className={`${fieldClass} mt-2`} />
          </div>
          <div>
            <Label htmlFor="password" className="font-bold">Password</Label>
            <Input id="password" name="password" type="password" minLength={6} required className={`${fieldClass} mt-2`} />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm font-bold text-primary hover:underline"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
