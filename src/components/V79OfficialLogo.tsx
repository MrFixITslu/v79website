import React from "react";

// Original uploaded artwork: do not crop, recolour, filter or rebuild as text.
const LOGO_SRC = "/v79-logo-192.webp";
const LOGO_ALT = "V79 Digital — From Idea to Advantage";

interface V79MarkProps {
  className?: string;
  size?: number | string;
  responsiveSizes?: string;
  loading?: "lazy" | "eager";
}

export function V79Mark({ className = "w-14 h-14", size, responsiveSizes = "96px", loading = "eager" }: V79MarkProps) {
  return (
    <img src={LOGO_SRC} srcSet="/v79-logo-192.webp 192w, /v79-logo-576.webp 576w" sizes={responsiveSizes} alt={LOGO_ALT} width={576} height={576} loading={loading}
      className={`block object-contain shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      decoding="async" draggable={false} />
  );
}

export interface V79OfficialLogoProps {
  className?: string;
  showMark?: boolean;
  showTagline?: boolean;
  inverted?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

// Legacy display flags remain accepted for callers, but the artwork stays intact.
export function V79OfficialLogo({
  className = "", size = "md",
}: V79OfficialLogoProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-48 h-48 sm:w-56 sm:h-56",
    xl: "w-60 h-60 sm:w-72 sm:h-72",
  };
  const responsiveSizes = size === "xl" ? "(min-width: 640px) 288px, 240px" : size === "lg" ? "(min-width: 640px) 224px, 192px" : size === "sm" ? "48px" : "96px";
  return <V79Mark className={`${sizes[size]} ${className}`} responsiveSizes={responsiveSizes} loading={size === "lg" || size === "xl" ? "lazy" : "eager"} />;
}

export function V79FooterLogo({ className = "" }: { className?: string }) {
  return <V79OfficialLogo size="lg" className={className} />;
}
