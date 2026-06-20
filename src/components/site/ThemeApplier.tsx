import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Auto-switches theme class on <body> based on current pathname.
 * - /dental*  -> theme-dental (blue)
 * - /physio*  -> theme-physio (green)
 * - default   -> teal brand theme
 */
export function ThemeApplier() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-dental", "theme-physio");
    if (pathname.startsWith("/dental")) body.classList.add("theme-dental");
    else if (pathname.startsWith("/physio")) body.classList.add("theme-physio");
  }, [pathname]);

  return null;
}
