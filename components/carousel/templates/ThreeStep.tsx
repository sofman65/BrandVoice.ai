import type { TemplateProps } from "@/components/carousel/types";

export function ThreeStep({ title, steps = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="180"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="72"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      {steps.slice(0, 3).map((s, i) => (
        <g key={i}>
          <circle cx="180" cy={400 + i * 250} r="60" fill={palette.accent} />
          <text
            x="180"
            y={410 + i * 250}
            textAnchor="middle"
            fontFamily="Inter"
            fontSize="56"
            fill={palette.text}
            fontWeight={700}
          >
            {i + 1}
          </text>

          <text
            x="300"
            y={410 + i * 250}
            fontFamily="Inter"
            fontSize="48"
            fill={palette.text}
          >
            {s}
          </text>
        </g>
      ))}
    </svg>
  );
}
