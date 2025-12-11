import type { TemplateProps } from "@/components/carousel/types";

export function CTAOverlay({ title, subtitle, palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={palette.stroke} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill={palette.bg} />
      <rect width="100%" height="100%" fill="url(#overlay)" />

      <text
        x="540"
        y="640"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="78"
        fill={palette.text}
        fontWeight={800}
      >
        {title}
      </text>
      <text
        x="540"
        y="760"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="44"
        fill={palette.subtext}
      >
        {subtitle}
      </text>
    </svg>
  );
}
