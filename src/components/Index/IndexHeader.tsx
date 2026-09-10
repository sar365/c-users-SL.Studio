import { BrandLogo, BrandName } from "@/components/BrandLogo";
import { Sparkles, Flame } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function IndexHeader() {
  return (
    <header className="flex flex-col items-center justify-center pt-8 pb-6 md:pt-12 md:pb-8 text-center relative w-full">
      <div className="absolute right-0 top-4 md:top-8">
        <ThemeToggle />
      </div>
      {/* Dynamic flame & red ambient glow in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-36 bg-gradient-to-r from-primary/10 via-primary/20 to-accent/20 blur-[70px] rounded-full pointer-events-none -z-10" />

      {/* Brand & Logo */}
      <div className="flex items-center gap-3.5 mb-2">
        <BrandLogo className="h-14 w-14 md:h-18 md:w-18" />
        <BrandName size="lg" />
      </div>

      {/* Tagline Badge with Yellow/Orange Ombre gradient border and glow */}
      <div data-testid="header-tagline-badge" className="flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-card/90 border border-border shadow-[0_0_15px_hsl(var(--primary)/0.18)] backdrop-blur-md">
        <Flame className="w-4 h-4 text-primary fill-primary animate-pulse" />
        <span className="text-xs md:text-sm font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
          Never lose the magic of a spontaneous mix. One click hits record for a permanent fix.
        </span>
        <Sparkles className="w-3.5 h-3.5 text-accent" />
      </div>
    </header>
  );
}