import type { TemplateProps } from "@/components/carousel/types";

export function BulletList({ title, bullets = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="180"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="70"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      {bullets.map((b, i) => (
        <g key={i}>
          <circle cx="180" cy={350 + i * 120} r="10" fill={palette.accent} />
          <text
            x="220"
            y={360 + i * 120}
            fontFamily="Inter"
            fontSize="46"
            fill={palette.text}
          >
            {b}
          </text>
        </g>
      ))}
    </svg>
  );
}
