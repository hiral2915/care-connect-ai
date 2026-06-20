import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ThemeApplier } from "./ThemeApplier";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ThemeApplier />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
