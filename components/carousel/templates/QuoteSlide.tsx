import type { TemplateProps } from "@/components/carousel/types";

export function QuoteSlide({ title, palette }: TemplateProps) {
  return (
    <svg width="1080" height="1350" viewBox="0 0 1080 1350">
      <rect width="100%" height="100%" fill={palette.bg} />

      <text
        x="540"
        y="650"
        textAnchor="middle"
        fontFamily="Inter"
        fontSize="70"
        fill={palette.text}
        fontWeight={600}
      >
        {title}
      </text>
    </svg>
  );
}
