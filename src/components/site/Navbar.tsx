import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, HeartHandshake, Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  const { user, profile, isAuthenticated, primaryRole, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardTo =
    primaryRole === "admin" ? "/admin" : primaryRole === "doctor" ? "/doctor" : "/patient";

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
    setOpen(false);
  }

  const displayName =
    profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Account";
  const initials = (profile?.full_name ?? user?.email ?? "?").slice(0, 2).toUpperCase();

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
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-primary-soft text-primary-strong" : "text-muted-foreground hover:text-foreground",
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

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={dashboardTo}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-brand text-[10px] font-bold text-primary-foreground">
                  {initials}
                </span>
                {displayName}
                {primaryRole && (
                  <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-strong">
                    {primaryRole}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium",
                    active ? "bg-primary-soft text-primary-strong" : "text-foreground hover:bg-muted",
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

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardTo}
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-medium"
                >
                  <LayoutDashboard className="h-4 w-4" /> My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="mt-1 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-border px-3 py-3 text-center text-sm font-medium">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-xl gradient-brand px-3 py-3 text-center text-sm font-semibold text-primary-foreground">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
