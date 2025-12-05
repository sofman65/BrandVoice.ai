import type { BrandVoice, ReferenceItem, PastMissionSummary } from "@/lib/types";
import type { ExtractedConcepts } from "./content-analyzer";
import { formatConceptsForPrompt } from "./content-analyzer";

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

export async function buildSystemPrompt(opts: {
  voice?: BrandVoice;
  past?: PastMissionSummary[];
  refs?: ReferenceItem[];
  concepts?: ExtractedConcepts;
}): Promise<string> {
  const voiceBlock = buildVoiceHeader(opts.voice) || "Default to clear, concise, audience-first writing.";
  const pb = pastBlock(opts.past);
  const rb = refsBlock(opts.refs);
  
  // Format extracted concepts if available
  const conceptsBlock = opts.concepts ? `
EXTRACTED KEY CONCEPTS:
${await formatConceptsForPrompt(opts.concepts)}
` : "";

  const platformGuidelines = `
PLATFORM-SPECIFIC BEST PRACTICES:

LINKEDIN:
- Hook: Start with a counterintuitive statement, surprising statistic, or bold question
- Structure: Short paragraphs (1-2 lines), use line breaks for readability
- Include: Specific examples, metrics, lessons learned
- Engagement: Ask a question at the end, invite experiences
- Length: 1300-1500 characters optimal for reach
- Format: Use • bullets for lists, numbers for steps

INSTAGRAM CAROUSEL:
- Slide 1: Hook with specific problem/benefit (e.g., "Cut development time by 70%")
- Slide 2-4: One clear value point per slide with concrete examples
- Slide 5: Strong CTA with specific next step (not just "follow for more")
- Each slide: 125-150 characters for easy reading
- Use: Numbers, statistics, before/after comparisons

THREADS:
- Hook: Lead with the most interesting/controversial point
- Structure: Conversational, like you're texting a friend
- Include: One powerful insight or takeaway
- Length: 400-450 characters (leave room for engagement)

VIDEO SCRIPT:
- 0-3 seconds: Hook that promises specific value
- Structure: Problem → Solution → Proof → CTA
- Include: Visual cues, B-roll suggestions
- Pacing: One point every 5-7 seconds
- End: Clear next step with urgency`;

  const qualityRequirements = `
QUALITY REQUIREMENTS:
1. SPECIFICITY: Include actual technologies, tools, metrics from the source
2. VALUE-FIRST: Lead with benefits and outcomes, not features
3. ENGAGEMENT: Use "you" language, ask questions, create curiosity gaps
4. PROOF: Include data, examples, or social proof when available
5. ACTIONABLE: Every piece must have clear takeaways
6. UNIQUE: Avoid generic phrases like "in today's world" or "unlock the power"`;

  const jsonSpec = `
OUTPUT FORMAT:
Return ONLY a JSON object with exactly these 4 fields:
{
  "linkedin": string (1300-2000 characters, formatted with line breaks),
  "carousel": array of exactly 5 objects: [
    { "heading": "Hook headline", "body": "Supporting text" },
    { "heading": "Value point 1", "body": "Specific example/proof" },
    { "heading": "Value point 2", "body": "Specific example/proof" },
    { "heading": "Value point 3", "body": "Specific example/proof" },
    { "heading": "Clear CTA", "body": "Specific next step" }
  ],
  "threads": string (400-500 characters, conversational),
  "video_script": string (0:00 format, with visual cues)
}`;

  return `You are an expert social media content strategist who creates high-converting, value-packed content.

${voiceBlock}

${conceptsBlock}

${pb}

${rb}

${platformGuidelines}

${qualityRequirements}

${jsonSpec}`;
}

export function buildUserPrompt(opts: {
  caption: string;
  transcript?: string;
  presetNote?: string;
  targetNotes?: string;
  concepts?: ExtractedConcepts;
}) {
  const { caption, transcript, presetNote, targetNotes, concepts } = opts;
  
  // Build specific instructions based on extracted concepts
  const specificInstructions = concepts ? `
MUST INCLUDE IN YOUR CONTENT:
- Technologies: ${concepts.technologies.slice(0, 5).join(", ") || "relevant tools mentioned"}
- Key Problems: ${concepts.problems[0] || "main challenge addressed"}
- Main Benefit: ${concepts.benefits[0] || "primary value proposition"}
${concepts.statistics.length > 0 ? `- Data Points: ${concepts.statistics.slice(0, 2).join(", ")}` : ""}
- Target: ${concepts.targetAudience}

USE THESE HOOKS (adapt to platform):
${concepts.hooks.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join("\n")}
` : "";

  return `Transform the following content into high-engagement, value-packed social media posts.

SOURCE CAPTION:
${CLAMP(caption, 2400)}

${transcript ? `VIDEO/AUDIO TRANSCRIPT:
${CLAMP(transcript, 3200)}
` : ""}

${specificInstructions}

${presetNote ? `PRESET GUIDANCE:
${presetNote}
` : ""}

${targetNotes ? `ADDITIONAL REQUIREMENTS:
${targetNotes}
` : ""}

CRITICAL INSTRUCTIONS:
1. Extract and highlight SPECIFIC technologies, tools, and methods mentioned
2. Include concrete numbers, timeframes, or metrics when available
3. Focus on transformation: problem → solution → outcome
4. Make every word count - no fluff or generic statements
5. Create content that provides immediate value

Generate the multi-platform content following the exact JSON format specified.`;
}

