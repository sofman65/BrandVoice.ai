import type { TemplateProps } from "@/components/carousel/types";

export function Timeline({ steps = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <line
        x1="540"
        y1="250"
        x2="540"
        y2="1100"
        stroke={palette.stroke}
        strokeWidth="6"
      />

      {steps.map((s, i) => (
        <g key={i}>
          <circle cx="540" cy={350 + i * 250} r="28" fill={palette.accent} />
          <text
            x="540"
            y={420 + i * 250}
            textAnchor="middle"
            fontFamily="Inter"
            fontSize="46"
            fill={palette.text}
          >
            {s}
          </text>
        </g>
      ))}
    </svg>
  );
}
