export interface TemplatePalette {
  bg: string;
  text: string;
  subtext: string;
  accent: string;
  stroke: string;
}

export interface TemplateProps {
  title?: string;
  subtitle?: string;
  steps?: string[];
  bullets?: string[];
  palette: TemplatePalette;
}
