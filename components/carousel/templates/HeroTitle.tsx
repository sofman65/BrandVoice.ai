import type { TemplateProps } from "@/components/carousel/types";

export function HeroTitle({ title, subtitle, palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350" viewBox="0 0 1080 1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="560"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="90"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      <text
        x="540"
        y="680"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="40"
        fill={palette.subtext}
      >
        {subtitle}
      </text>
    </svg>
  );
}
