import type { TemplateProps } from "@/components/carousel/types";

export function CTA({ title, subtitle, palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="620"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="82"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      <text
        x="540"
        y="750"
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
