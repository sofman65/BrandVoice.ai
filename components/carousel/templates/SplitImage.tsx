import type { TemplateProps } from "@/components/carousel/types";

export function SplitImage({ title, subtitle, palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="150"
        y="250"
        fontFamily="Inter"
        fontSize="70"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      <text
        x="150"
        y="340"
        fontFamily="Inter"
        fontSize="42"
        fill={palette.subtext}
      >
        {subtitle}
      </text>

      <rect
        x="150"
        y="450"
        width="780"
        height="700"
        rx="30"
        fill={palette.stroke}
        opacity="0.15"
      />

      <text x="540" y="800" textAnchor="middle" fill={palette.subtext}>
        AI Image goes here
      </text>
    </svg>
  );
}
