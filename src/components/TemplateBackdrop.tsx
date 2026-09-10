import React from "react";

interface TemplateBackdropProps {
  className?: string;
}

export function TemplateBackdrop({ className = "" }: TemplateBackdropProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* High Quality Disco DJ Artwork */}
      <img
        src="/assets/disco-dj-backdrop.png"
        alt="SL.STUDIO DJ Backdrop"
        className="w-full h-full object-cover object-top filter contrast-125 saturate-110 brightness-95 transform scale-100 transition-transform duration-700 hover:scale-105"
      />

      {/* Ethereal Pink, Purple, and Yellow Glow Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-accent/15 pointer-events-none" />

      {/* Subtle vignette border to keep focus on the DJ decks */}
      <div className="absolute inset-0 ring-1 ring-inset ring-border/60 rounded-3xl pointer-events-none" />
    </div>
  );
}

export default TemplateBackdrop;
