import React from "react";

interface BrandNameProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

const letterGradients = [
  { char: "S", isMirrored: false, color: "text-yellow-400", className: "-mr-0.5" },
  { char: "L", isMirrored: false, color: "text-yellow-400", className: "-ml-0.5 mr-0" },
  { char: ".", isMirrored: false, color: "text-yellow-300 font-black", className: "mx-0.5 transform translate-y-[-1px]" },
  { char: "S", isMirrored: false, color: "text-yellow-400", className: "" },
  { char: "T", isMirrored: false, color: "text-yellow-300", className: "" },
  { char: "U", isMirrored: false, color: "text-yellow-400", className: "" },
  { char: "D", isMirrored: false, color: "text-yellow-300", className: "" },
  { char: "I", isMirrored: false, color: "text-yellow-400", className: "" },
  { char: "O", isMirrored: false, color: "text-yellow-300", className: "" },
];

export const MirroredS = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block transform -scale-x-100 select-none origin-center text-yellow-400 ${className}`}
    aria-hidden="true"
  >
    S
  </span>
);

export const MirroredL = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block transform -scale-x-100 select-none origin-center text-yellow-400 ${className}`}
    aria-hidden="true"
  >
    L
  </span>
);

export const BrandName = ({ className = "", size = "md", showSubtitle = false }: BrandNameProps) => {
  const sizeClasses = {
    sm: "text-base font-extrabold tracking-normal",
    md: "text-2xl sm:text-3xl font-black tracking-normal",
    lg: "text-3xl sm:text-5xl font-black tracking-normal",
    xl: "text-5xl sm:text-6xl md:text-7xl font-black tracking-normal",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`font-display inline-flex items-center select-none ${sizeClasses[size]} ${className}`}>
        {letterGradients.map((item, idx) => (
          <span
            key={idx}
            className={`inline-block font-black transition-transform duration-200 hover:scale-110 ${item.color} ${
              item.isMirrored ? "transform -scale-x-100" : ""
            } ${item.className || ""}`}
          >
            {item.char}
          </span>
        ))}
      </div>

      {showSubtitle && (
        <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold mt-1.5 text-yellow-400/80">
          Record What You Hear
        </span>
      )}
    </div>
  );
};

export const BrandLogo = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative flex items-center justify-center rounded-2xl ${className}`}
  >
    <div className="w-full h-full rounded-2xl bg-transparent flex items-center justify-center">
      <img
        src="/assets/sl-studio-logo.jpg"
        alt="SL.STUDIO logo"
        className="h-full w-full object-contain filter hue-rotate-[85deg] saturate-[0.8] drop-shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  </div>
);

export default BrandName;
