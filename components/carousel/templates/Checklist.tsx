import type { TemplateProps } from "@/components/carousel/types";

export function Checklist({ title, bullets = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="200"
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
          <rect
            x="150"
            y={300 + i * 150}
            width="780"
            height="110"
            rx="20"
            fill={palette.stroke}
            opacity={0.2}
          />
          <rect
            x="180"
            y={330 + i * 150}
            width="36"
            height="36"
            rx="8"
            fill={palette.accent}
          />
          <text
            x="240"
            y={360 + i * 150}
            fontFamily="Inter"
            fontSize="44"
            fill={palette.text}
          >
            {b}
          </text>
        </g>
      ))}
    </svg>
  );
}
