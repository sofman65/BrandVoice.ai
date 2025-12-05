"use server";
import "server-only";

import { getOpenAI, withTimeout } from "./openai-client";
import type { ExtractedConcepts } from "./content-analyzer";
import type { CarouselSlide } from "@/lib/types";

interface CarouselStructure {
  hook: string;
  valuePoints: string[];
  cta: string;
  audience: string;
}

/**
 * Generates a high-converting carousel structure based on extracted concepts
 */
export async function generateCarouselStructure(
  concepts: ExtractedConcepts,
  brandVoice?: { ctaStyle?: string; audience?: string }
): Promise<CarouselStructure> {
  const openai = await getOpenAI();
  
  if (!openai || !process.env.OPENAI_API_KEY) {
    return getFallbackStructure(concepts, brandVoice);
  }

  const prompt = `Based on these concepts, create a high-converting Instagram carousel structure:

MAIN TOPICS: ${concepts.mainTopics.join(", ")}
TECHNOLOGIES: ${concepts.technologies.join(", ")}
KEY PROBLEMS: ${concepts.problems.slice(0, 3).join("; ")}
KEY BENEFITS: ${concepts.benefits.slice(0, 3).join("; ")}
TARGET AUDIENCE: ${concepts.targetAudience}
${concepts.statistics.length > 0 ? `DATA POINTS: ${concepts.statistics.join(", ")}` : ""}

Create a JSON structure with:
{
  "hook": "Attention-grabbing opening that addresses a specific problem or promises a benefit (use numbers if available)",
  "valuePoints": ["3 specific value points that solve problems or deliver benefits"],
  "cta": "Clear, specific call-to-action that tells them exactly what to do next",
  "audience": "Who this is specifically for"
}

Make the hook specific and benefit-focused. Each value point should be concrete and actionable.`;

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert at creating viral Instagram carousel content that drives engagement." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      }),
      15000,
      "Carousel structure generation"
    );

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new Error("No structure generated");

    return JSON.parse(result) as CarouselStructure;
  } catch (error) {
    console.error("Failed to generate carousel structure:", error);
    return getFallbackStructure(concepts, brandVoice);
  }
}

/**
 * Transforms a carousel structure into formatted slides
 */
export async function structureToSlides(structure: CarouselStructure, concepts: ExtractedConcepts): Promise<CarouselSlide[]> {
  const slides: CarouselSlide[] = [];

  // Slide 1: Hook
  slides.push({
    heading: formatHook(structure.hook),
    body: `For ${structure.audience}${concepts.technologies.length > 0 ? ` using ${concepts.technologies[0]}` : ""}`,
  });

  // Slides 2-4: Value Points
  structure.valuePoints.slice(0, 3).forEach((point, index) => {
    const heading = extractHeading(point);
    const body = expandValuePoint(point, concepts, index);
    
    slides.push({ heading, body });
  });

  // Slide 5: CTA
  slides.push({
    heading: "Ready to Start?",
    body: structure.cta,
  });

  return slides;
}

/**
 * Formats a hook to be punchy and specific
 */
function formatHook(hook: string): string {
  // Remove generic phrases
  hook = hook.replace(/^(Discover|Learn|Unlock|Master|Transform) /, "");
  
  // Ensure it starts strong
  if (!hook.match(/^(Stop|How|Why|\d+|The)/i)) {
    // If it doesn't start with a power word, add one based on content
    if (hook.includes("%") || hook.includes("x") || hook.match(/\d+/)) {
      hook = `📈 ${hook}`;
    } else if (hook.toLowerCase().includes("mistake") || hook.toLowerCase().includes("wrong")) {
      hook = `⚠️ ${hook}`;
    } else {
      hook = `💡 ${hook}`;
    }
  }
  
  // Truncate if too long
  if (hook.length > 60) {
    hook = hook.substring(0, 57) + "...";
  }
  
  return hook;
}

/**
 * Extracts a heading from a value point
 */
function extractHeading(point: string): string {
  // Take first 40 characters or up to first period/colon
  const match = point.match(/^([^.:]+)/);
  const heading = match ? match[1].trim() : point.substring(0, 40);
  
  // Add emoji if it starts with a number
  if (heading.match(/^\d/)) {
    return `📊 ${heading}`;
  }
  
  return heading;
}

/**
 * Expands a value point with specific details
 */
function expandValuePoint(point: string, concepts: ExtractedConcepts, index: number): string {
  // Try to match value point with relevant concept
  let expansion = point;
  
  // Add relevant technology if available
  if (concepts.technologies.length > index) {
    expansion += ` with ${concepts.technologies[index]}`;
  }
  
  // Add a statistic if available
  if (concepts.statistics.length > index) {
    expansion += ` (${concepts.statistics[index]})`;
  }
  
  // Ensure it's not too long
  if (expansion.length > 150) {
    expansion = expansion.substring(0, 147) + "...";
  }
  
  return expansion;
}

/**
 * Generates fallback carousel structure when API fails
 */
function getFallbackStructure(concepts: ExtractedConcepts, brandVoice?: { ctaStyle?: string; audience?: string }): CarouselStructure {
  const hook = concepts.hooks[0] || `Stop struggling with ${concepts.problems[0] || "complex workflows"}`;
  
  const valuePoints = [
    concepts.benefits[0] || "Save hours of development time",
    concepts.benefits[1] || "Implement proven strategies that work",
    concepts.benefits[2] || "Get results faster with the right approach"
  ];
  
  const cta = brandVoice?.ctaStyle || "Try these techniques in your next project and see the difference";
  
  return {
    hook,
    valuePoints,
    cta,
    audience: concepts.targetAudience || brandVoice?.audience || "developers and creators"
  };
}

/**
 * Post-processes carousel slides to ensure quality
 */
export async function enhanceCarouselSlides(slides: CarouselSlide[], concepts: ExtractedConcepts): Promise<CarouselSlide[]> {
  return slides.map((slide, index) => {
    if (typeof slide === "string") {
      return {
        heading: `Point ${index + 1}`,
        body: slide
      };
    }
    
    // Ensure each slide has both heading and body
    if (!slide.heading || !slide.body) {
      return {
        heading: slide.heading || `Insight ${index + 1}`,
        body: slide.body || "Continue reading for more value..."
      };
    }
    
    // Enhance first slide (hook)
    if (index === 0) {
      // Make sure hook is specific
      if (slide.heading.length < 20 && concepts.problems.length > 0) {
        slide.heading = `${slide.heading}: ${concepts.problems[0]}`;
      }
    }
    
    // Enhance middle slides (value points)
    if (index > 0 && index < 4) {
      // Add specificity if generic
      if (slide.body.length < 50 && concepts.technologies.length > 0) {
        slide.body = `${slide.body} using ${concepts.technologies[Math.min(index - 1, concepts.technologies.length - 1)]}`;
      }
    }
    
    // Enhance last slide (CTA)
    if (index === 4) {
      // Make CTA specific and actionable
      if (!slide.body.includes("http") && !slide.body.includes("link") && !slide.body.includes("comment")) {
        slide.body = `${slide.body}. Drop a comment with your biggest challenge!`;
      }
    }
    
    return slide;
  });
}