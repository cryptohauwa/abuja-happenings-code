import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { CalendarDays, CalendarHeart, Home, LogIn, LogOut, Search } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">We couldn't find that page</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have ended already, or the link is wrong.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Abuja Happenings — What's on around the city" },
      {
        name: "description",
        content:
          "A community events board for Abuja. Post and discover concerts, markets, workshops and family days around the city.",
      },
      { name: "author", content: "Abuja Happenings" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const navLink =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3";
const navActive = { className: "bg-accent text-accent-foreground" };

function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarHeart className="h-5 w-5" aria-hidden />
          </span>
          <span className="truncate whitespace-nowrap font-display text-sm font-bold sm:text-lg">Abuja Happenings</span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-bold sm:gap-1">
          <Link to="/" className={navLink} activeProps={navActive} activeOptions={{ exact: true }} aria-label="Home">
            <Home className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/events" search={{ family: false }} className={navLink} activeProps={navActive}>
            <Search className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Browse</span>
            <span className="sr-only sm:hidden">Browse</span>
          </Link>
          <Link to="/my-calendar" className={navLink} activeProps={navActive} aria-label="My calendar">
            <CalendarDays className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Calendar</span>
          </Link>
          <Link to="/calendar-feeds" className={navLink.replace("inline-flex", "hidden lg:inline-flex")} activeProps={navActive}>
            Calendar feeds
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className={navLink}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          ) : (
            <Link to="/auth" className={navLink} activeProps={navActive} aria-label="Sign in">
              <LogIn className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Sign in</span>
            </Link>
          )}
          <Link
            to="/submit"
            className="ml-1 whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-primary-foreground shadow-[var(--shadow-soft)] transition-colors hover:bg-primary/90 sm:px-4"
          >
            <span className="sm:hidden">Post</span>
            <span className="hidden sm:inline">Post an event</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-foreground">Abuja Happenings</p>
        <p>A neighbourhood bulletin board for the city — big events and small ones.</p>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
