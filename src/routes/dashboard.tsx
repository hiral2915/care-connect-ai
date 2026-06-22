/**
 * /dashboard — Role-aware entry point.
 * Redirects to the appropriate dashboard based on the user's primary role.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardEntry,
});

function DashboardEntry() {
  const { isLoading, isAuthenticated, primaryRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/dashboard" } });
      return;
    }
    if (primaryRole === "admin") navigate({ to: "/admin", replace: true });
    else if (primaryRole === "doctor") navigate({ to: "/doctor", replace: true });
    else navigate({ to: "/patient", replace: true });
  }, [isLoading, isAuthenticated, primaryRole, navigate]);

  return (
    <SiteLayout>
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your dashboard…
      </div>
    </SiteLayout>
  );
}
