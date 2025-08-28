import type { BrandVoice, ReferenceItem, PastMissionSummary } from "@/lib/types";

const CLAMP = (s = "", max = 800) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

export function buildVoiceHeader(voice?: BrandVoice): string {
  if (!voice) return "";
  const tags = Array.isArray(voice.hashtags) && voice.hashtags.length ? voice.hashtags.join(", ") : "";
  return `You must follow this Brand Voice exactly (hard constraints):
- Name: ${voice.name}
- Tone: ${voice.tone}
- Style: ${voice.style}
- Vocabulary: ${voice.vocabulary}
- Audience: ${voice.audience}
- CTA Style: ${voice.ctaStyle ?? "invite conversation"}
- Hashtags (optional): ${tags}`;
}

function pastBlock(past?: PastMissionSummary[]) {
  if (!past?.length) return "No past missions selected.";
  return `Use the following PAST MISSIONS to match tone/structure (secondary constraints):
${past
    .slice(0, 3)
    .map(
      (p, i) => `— [P${i + 1}] ${p.title ?? p.id}
  Tone hint: ${p.tone_hint ?? "n/a"}
  Summary: ${CLAMP(p.summary, 800)}`,
    )
    .join("\n\n")}
If style conflicts with the Brand Voice, favor the Brand Voice.`;
}

function refsBlock(refs?: ReferenceItem[]) {
  if (!refs?.length) return "No external references selected.";
  return `Use these EXTERNAL REFERENCES for stylistic inspiration only (tertiary influence). Do NOT copy wording:
${refs
    .slice(0, 3)
    .map(
      (r, i) => `— [R${i + 1}] ${r.title ?? r.url ?? r.id} (${r.platform ?? "web"})
  Summary: ${CLAMP(r.summary ?? "", 600)}
  Key points: ${(r.key_points ?? []).slice(0, 4).map((k) => `• ${k}`).join(" ") || "n/a"}`,
    )
    .join("\n\n")}`;
}

export function buildSystemPrompt(opts: {
  voice?: BrandVoice;
  past?: PastMissionSummary[];
  refs?: ReferenceItem[];
}) {
  const voiceBlock = buildVoiceHeader(opts.voice) || "Default to clear, concise, audience-first writing.";
  const pb = pastBlock(opts.past);
  const rb = refsBlock(opts.refs);

  const jsonSpec = `IMPORTANT: Return ONLY a JSON object with exactly these 4 fields:
- "linkedin": string (professional long-form)
- "carousel": array of 5 objects: [{ "heading": string, "body": string }]
- "threads": string (<= 500 characters)
- "video_script": string (multi-line with timing cues)`;

  return `${voiceBlock}

${pb}

${rb}

You are the BrandVoice.ai writer. Priorities:
1) Obey Brand Voice.
2) Align with Past Missions' tone/structure.
3) Draw inspiration from External References (no copying).

${jsonSpec}`;
}

export function buildUserPrompt(opts: {
  caption: string;
  transcript?: string;
  presetNote?: string;
  targetNotes?: string;
}) {
  const { caption, transcript, presetNote, targetNotes } = opts;
  return `Transform the following into multi-platform outputs.

SOURCE CAPTION:
${CLAMP(caption, 2400)}

${transcript ? `OPTIONAL TRANSCRIPT:\n${CLAMP(transcript, 3200)}\n` : ""}

${presetNote ? `PRESET GUIDANCE:\n${presetNote}\n` : ""}

${targetNotes ? `ADDITIONAL CONSTRAINTS:\n${targetNotes}\n` : ""}

Return valid JSON per the system spec.`;
}

