import type { TemplateProps } from "@/components/carousel/types";

export function BeforeAfter({ title, bullets = [], palette }: TemplateProps) {
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

      <text
        x="270"
        y="260"
        textAnchor="middle"
        fontSize="50"
        fill={palette.accent}
        fontFamily="Inter"
      >
        BEFORE
      </text>
      <text
        x="810"
        y="260"
        textAnchor="middle"
        fontSize="50"
        fill={palette.accent}
        fontFamily="Inter"
      >
        AFTER
      </text>

      {bullets.slice(0, 4).map((b, i) => (
        <g key={i}>
          <text
            x="140"
            y={380 + i * 120}
            fontSize="44"
            fill={palette.text}
            fontFamily="Inter"
          >
            • {b}
          </text>

          <text
            x="600"
            y={380 + i * 120}
            fontSize="44"
            fill={palette.text}
            fontFamily="Inter"
          >
            • {bullets[i + 4] || ""}
          </text>
        </g>
      ))}
    </svg>
  );
}
