import type { TemplateProps } from "@/components/carousel/types";

export function BoldChecklist({ title, bullets = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="200"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="76"
        fill={palette.text}
        fontWeight={800}
      >
        {title}
      </text>

      {bullets.slice(0, 5).map((b, i) => (
        <g key={i}>
          <rect
            x="120"
            y={320 + i * 180}
            width="840"
            height="140"
            rx="28"
            fill={palette.stroke}
            opacity="0.15"
          />
          <rect
            x="150"
            y={360 + i * 180}
            width="52"
            height="52"
            rx="12"
            fill={palette.accent}
          />
          <text
            x="220"
            y={400 + i * 180}
            fontFamily="Inter"
            fontSize="48"
            fill={palette.text}
            fontWeight={600}
          >
            {b}
          </text>
        </g>
      ))}
    </svg>
  );
}
