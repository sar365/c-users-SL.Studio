import { Sparkles } from "lucide-react";

export function IndexFooter() {
  return (
    <footer className="relative py-8 text-center text-xs text-neutral-400 w-full max-w-4xl mt-12 flex flex-col items-center">
      {/* Gradient border separator */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400/50 to-transparent mb-6" />

      <p className="flex items-center justify-center gap-1.5 text-sm text-neutral-200">
        <Sparkles className="w-4 h-4 text-accent animate-pulse fill-accent/50" />
        <span>Companion web interface for</span>
        <span className="font-black inline-flex items-center text-base tracking-normal">
          <span className="inline-block text-primary -mr-0.5">S</span>
          <span className="inline-block text-primary -ml-0.5">L</span>
          <span className="text-accent mx-0.5">.</span>
          <span className="text-primary">S</span>
          <span className="text-accent">T</span>
          <span className="text-primary">U</span>
          <span className="text-accent">D</span>
          <span className="text-primary">I</span>
          <span className="text-accent">O</span>
        </span>
      </p>
      <p className="text-xs text-neutral-400 mt-2">
        Designed for DJ sets, live streams, and high-fidelity system audio archiving.
      </p>
    </footer>
  );
}
