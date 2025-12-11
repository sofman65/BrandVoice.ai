import type { TemplateProps } from "@/components/carousel/types";

export function Comparison({ title, bullets = [], palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="200"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="72"
        fill={palette.text}
        fontWeight={700}
      >
        {title}
      </text>

      {/* Left */}
      <rect
        x="100"
        y="300"
        width="380"
        height="800"
        rx="40"
        fill={palette.stroke}
        opacity="0.15"
      />
      <text
        x="290"
        y="380"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="50"
        fill={palette.accent}
      >
        A
      </text>

      {bullets.slice(0, 3).map((b, i) => (
        <text
          key={i}
          x="140"
          y={480 + i * 120}
          fontFamily="Inter"
          fontSize="44"
          fill={palette.text}
        >
          • {b}
        </text>
      ))}

      {/* Right */}
      <rect
        x="600"
        y="300"
        width="380"
        height="800"
        rx="40"
        fill={palette.stroke}
        opacity="0.15"
      />
      <text
        x="790"
        y="380"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="50"
        fill={palette.accent}
      >
        B
      </text>

      {bullets.slice(3, 6).map((b, i) => (
        <text
          key={i}
          x="640"
          y={480 + i * 120}
          fontFamily="Inter"
          fontSize="44"
          fill={palette.text}
        >
          • {b}
        </text>
      ))}
    </svg>
  );
}
