import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, HeartHandshake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/dental", label: "Dental" },
  { to: "/physio", label: "Physiotherapy" },
  { to: "/doctors", label: "Doctors" },
  { to: "/ngo", label: "NGO Support" },
  { to: "/ai-prioritization", label: "AI Priority", icon: Sparkles },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-elegant">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight">CareConnect</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              AI · Clinic + NGO
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary-strong"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/donate"
            className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
          >
            Donate
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium",
                    active
                      ? "bg-primary-soft text-primary-strong"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-secondary px-3 py-3 text-center text-sm font-semibold text-secondary-foreground"
            >
              Donate
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
