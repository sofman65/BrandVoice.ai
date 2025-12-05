"use server";
import "server-only";

import type { GeneratedContent, CarouselSlide } from "@/lib/types";
import type { ExtractedConcepts } from "./content-analyzer";

export interface QualityScore {
  overall: number; // 0-100
  specificity: number; // How specific vs generic
  engagement: number; // Hooks, questions, CTAs
  value: number; // Clear benefits and takeaways
  brandAlignment: number; // Matches voice and style
  issues: string[]; // List of problems found
  suggestions: string[]; // Improvement suggestions
}

/**
 * Validates the quality of generated content
 */
export async function validateContent(
  content: GeneratedContent,
  concepts: ExtractedConcepts,
  voice?: { tone?: string; style?: string; vocabulary?: string }
): Promise<QualityScore> {
  const scores = {
    linkedin: validateLinkedIn(content.linkedin, concepts),
    carousel: validateCarousel(content.carousel, concepts),
    threads: validateThreads(content.threads, concepts),
    videoScript: validateVideoScript(content.video_script, concepts),
  };

  // Calculate overall scores
  const specificity = Math.round(
    (scores.linkedin.specificity + scores.carousel.specificity + scores.threads.specificity + scores.videoScript.specificity) / 4
  );
  
  const engagement = Math.round(
    (scores.linkedin.engagement + scores.carousel.engagement + scores.threads.engagement + scores.videoScript.engagement) / 4
  );
  
  const value = Math.round(
    (scores.linkedin.value + scores.carousel.value + scores.threads.value + scores.videoScript.value) / 4
  );

  // Brand alignment (simplified check)
  const brandAlignment = voice ? checkBrandAlignment(content, voice) : 75;

  const overall = Math.round((specificity + engagement + value + brandAlignment) / 4);

  // Collect all issues and suggestions
  const allIssues = [
    ...scores.linkedin.issues,
    ...scores.carousel.issues,
    ...scores.threads.issues,
    ...scores.videoScript.issues,
  ];

  const allSuggestions = [
    ...scores.linkedin.suggestions,
    ...scores.carousel.suggestions,
    ...scores.threads.suggestions,
    ...scores.videoScript.suggestions,
  ];

  return {
    overall,
    specificity,
    engagement,
    value,
    brandAlignment,
    issues: [...new Set(allIssues)], // Remove duplicates
    suggestions: [...new Set(allSuggestions)],
  };
}

/**
 * Validates LinkedIn content quality
 */
function validateLinkedIn(content: string, concepts: ExtractedConcepts): {
  specificity: number;
  engagement: number;
  value: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let specificity = 0;
  let engagement = 0;
  let value = 0;

  // Check for specific technologies mentioned
  const techMentions = concepts.technologies.filter(tech => 
    content.toLowerCase().includes(tech.toLowerCase())
  );
  specificity += Math.min(techMentions.length * 20, 40);
  
  if (techMentions.length === 0) {
    issues.push("LinkedIn post doesn't mention specific technologies");
    suggestions.push("Include specific tools/technologies from the source");
  }

  // Check for statistics or numbers
  const hasNumbers = /\d+[%xX]?|\$\d+/.test(content);
  if (hasNumbers) {
    specificity += 20;
  } else {
    issues.push("LinkedIn post lacks concrete numbers or metrics");
    suggestions.push("Add specific statistics or metrics for credibility");
  }

  // Check for hook at the beginning
  const firstLine = content.split('\n')[0];
  if (firstLine.length > 20 && !firstLine.startsWith("Did you know") && !firstLine.startsWith("Today")) {
    engagement += 30;
  } else {
    issues.push("LinkedIn post has weak opening hook");
    suggestions.push("Start with a bold statement, question, or surprising fact");
  }

  // Check for question or CTA
  const hasQuestion = content.includes('?');
  const hasCTA = /comment|share|follow|check out|try|download|visit/i.test(content);
  if (hasQuestion) engagement += 20;
  if (hasCTA) engagement += 20;
  
  if (!hasQuestion && !hasCTA) {
    issues.push("LinkedIn post lacks engagement elements");
    suggestions.push("Add a question or clear call-to-action");
  }

  // Check for value proposition
  const hasBenefits = concepts.benefits.some(benefit => 
    content.toLowerCase().includes(benefit.toLowerCase().substring(0, 10))
  );
  if (hasBenefits) {
    value += 40;
  } else {
    issues.push("LinkedIn post doesn't clearly state benefits");
    suggestions.push("Explicitly mention key benefits or outcomes");
  }

  // Check for actionable content
  const actionWords = /learn|discover|implement|apply|build|create|improve|optimize/i;
  if (actionWords.test(content)) {
    value += 30;
  }

  // Length check (optimal LinkedIn posts are 1300-1900 characters)
  if (content.length >= 1000 && content.length <= 2000) {
    value += 30;
  } else if (content.length < 600) {
    issues.push("LinkedIn post is too short for optimal engagement");
    suggestions.push("Expand with more details, examples, or insights");
  }

  // Ensure minimum scores
  specificity = Math.max(specificity, 20);
  engagement = Math.max(engagement, 20);
  value = Math.max(value, 20);

  return { specificity, engagement, value, issues, suggestions };
}

/**
 * Validates carousel content quality
 */
function validateCarousel(carousel: CarouselSlide[], concepts: ExtractedConcepts): {
  specificity: number;
  engagement: number;
  value: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let specificity = 0;
  let engagement = 0;
  let value = 0;

  // Check if we have exactly 5 slides
  if (carousel.length !== 5) {
    issues.push(`Carousel has ${carousel.length} slides instead of 5`);
  }

  // Analyze first slide (hook)
  const firstSlide = carousel[0];
  const firstSlideText = typeof firstSlide === 'string' ? firstSlide : `${firstSlide.heading} ${firstSlide.body}`;
  
  if (firstSlideText.length > 20 && !firstSlideText.toLowerCase().includes("learn")) {
    engagement += 30;
  } else {
    issues.push("Carousel hook is weak or generic");
    suggestions.push("Start with a specific problem or benefit");
  }

  // Check for specific content in slides
  let techMentionCount = 0;
  let hasNumbers = false;
  
  carousel.forEach((slide, index) => {
    const slideText = typeof slide === 'string' ? slide : `${slide.heading} ${slide.body}`;
    
    // Check for technology mentions
    concepts.technologies.forEach(tech => {
      if (slideText.toLowerCase().includes(tech.toLowerCase())) {
        techMentionCount++;
      }
    });
    
    // Check for numbers
    if (/\d+[%xX]?|\$\d+/.test(slideText)) {
      hasNumbers = true;
    }
    
    // Check slide length (shouldn't be too long for Instagram)
    if (slideText.length > 200) {
      issues.push(`Slide ${index + 1} is too long for easy reading`);
      suggestions.push(`Shorten slide ${index + 1} to under 150 characters`);
    }
  });

  specificity += Math.min(techMentionCount * 10, 40);
  if (hasNumbers) specificity += 20;
  
  if (techMentionCount === 0) {
    issues.push("Carousel lacks specific technology mentions");
    suggestions.push("Include specific tools or technologies in slides");
  }

  // Check last slide for CTA
  const lastSlide = carousel[carousel.length - 1];
  const lastSlideText = typeof lastSlide === 'string' ? lastSlide : `${lastSlide.heading} ${lastSlide.body}`;
  
  if (/comment|share|follow|save|try|link|bio/i.test(lastSlideText)) {
    engagement += 30;
  } else {
    issues.push("Carousel lacks strong call-to-action");
    suggestions.push("Add specific CTA to final slide");
  }

  // Check for value progression
  const middleSlides = carousel.slice(1, 4);
  let hasValuePoints = 0;
  
  middleSlides.forEach(slide => {
    const slideText = typeof slide === 'string' ? slide : `${slide.heading} ${slide.body}`;
    if (slideText.length > 30 && !slideText.toLowerCase().includes("continue")) {
      hasValuePoints++;
    }
  });
  
  value += hasValuePoints * 20;
  
  if (hasValuePoints < 2) {
    issues.push("Carousel middle slides lack concrete value");
    suggestions.push("Make each slide deliver one clear insight or benefit");
  }

  // Ensure minimum scores
  specificity = Math.max(specificity, 20);
  engagement = Math.max(engagement, 20);
  value = Math.max(value, 20);

  return { specificity, engagement, value, issues, suggestions };
}

/**
 * Validates Threads content quality
 */
function validateThreads(content: string, concepts: ExtractedConcepts): {
  specificity: number;
  engagement: number;
  value: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let specificity = 0;
  let engagement = 0;
  let value = 0;

  // Length check (Threads optimal is 400-500 chars)
  if (content.length > 500) {
    issues.push("Threads post is too long (>500 chars)");
    suggestions.push("Trim to under 500 characters");
  } else if (content.length < 200) {
    issues.push("Threads post is too short");
    suggestions.push("Expand with more specific details");
  } else {
    value += 30;
  }

  // Check for conversational tone
  const conversational = /you|your|let's|here's|I've|we've/i.test(content);
  if (conversational) {
    engagement += 30;
  } else {
    issues.push("Threads post lacks conversational tone");
    suggestions.push("Use 'you' language and write like texting a friend");
  }

  // Check for specific content
  const hasTech = concepts.technologies.some(tech => 
    content.toLowerCase().includes(tech.toLowerCase())
  );
  if (hasTech) specificity += 40;

  const hasHook = !content.toLowerCase().startsWith("check out") && 
                  !content.toLowerCase().startsWith("just");
  if (hasHook) engagement += 30;

  // Check for emoji usage (good for Threads)
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content);
  if (hasEmoji) engagement += 10;

  // Ensure minimum scores
  specificity = Math.max(specificity, 20);
  engagement = Math.max(engagement, 20);
  value = Math.max(value, 20);

  return { specificity, engagement, value, issues, suggestions };
}

/**
 * Validates video script quality
 */
function validateVideoScript(content: string, concepts: ExtractedConcepts): {
  specificity: number;
  engagement: number;
  value: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let specificity = 0;
  let engagement = 0;
  let value = 0;

  // Check for timing markers
  const hasTimings = /\d+:\d+/.test(content);
  if (hasTimings) {
    value += 30;
  } else {
    issues.push("Video script lacks timing markers");
    suggestions.push("Add timestamps (0:00 format) for pacing");
  }

  // Check for hook in first 3 seconds
  const lines = content.split('\n');
  const firstLine = lines[0] || '';
  if (firstLine.includes("0:0") && firstLine.length > 20) {
    engagement += 30;
  } else {
    issues.push("Video script needs stronger hook");
    suggestions.push("Start with attention-grabbing statement in first 3 seconds");
  }

  // Check for specific content mentions
  const techMentions = concepts.technologies.filter(tech => 
    content.toLowerCase().includes(tech.toLowerCase())
  );
  specificity += Math.min(techMentions.length * 15, 45);

  // Check for visual cues
  const hasVisualCues = /b-roll|show|display|cut to|visual|screen/i.test(content);
  if (hasVisualCues) {
    value += 20;
  } else {
    issues.push("Video script lacks visual direction");
    suggestions.push("Add B-roll suggestions and visual cues");
  }

  // Check for CTA
  const hasCTA = /subscribe|follow|comment|link|bio|check/i.test(content);
  if (hasCTA) engagement += 20;

  // Check structure (problem → solution → proof → CTA)
  const hasStructure = content.length > 200 && lines.length > 5;
  if (hasStructure) value += 20;

  // Ensure minimum scores
  specificity = Math.max(specificity, 20);
  engagement = Math.max(engagement, 20);
  value = Math.max(value, 20);

  return { specificity, engagement, value, issues, suggestions };
}

/**
 * Checks brand voice alignment
 */
function checkBrandAlignment(
  content: GeneratedContent,
  voice: { tone?: string; style?: string; vocabulary?: string }
): number {
  let score = 50; // Base score

  const allContent = `${content.linkedin} ${content.threads} ${content.video_script}`;
  
  // Simple tone checking
  if (voice.tone) {
    const toneWords = voice.tone.toLowerCase().split(/[,\s]+/);
    toneWords.forEach(word => {
      if (word === "professional" && !/emoji/i.test(allContent)) score += 5;
      if (word === "friendly" && /you|your|let's/i.test(allContent)) score += 5;
      if (word === "casual" && /!\?|😊|👉/u.test(allContent)) score += 5;
    });
  }

  // Vocabulary checking
  if (voice.vocabulary?.includes("emoji") && /[\u{1F300}-\u{1F9FF}]/u.test(allContent)) {
    score += 10;
  }
  if (voice.vocabulary?.includes("no jargon") && !/leverage|synergy|paradigm/i.test(allContent)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Determines if content needs regeneration based on quality score
 */
export async function shouldRegenerate(score: QualityScore): Promise<boolean> {
  // Regenerate if overall score is below 50 or has critical issues
  if (score.overall < 50) return true;
  
  // Regenerate if any component score is very low
  if (score.specificity < 30 || score.engagement < 30 || score.value < 30) return true;
  
  // Check for critical issues
  const criticalIssues = [
    "doesn't mention specific technologies",
    "lacks concrete numbers",
    "too short",
    "weak opening hook",
  ];
  
  const hasCriticalIssue = score.issues && Array.isArray(score.issues) ? 
    score.issues.some(issue => 
      criticalIssues.some(critical => issue.includes(critical))
    ) : false;
  
  return hasCriticalIssue;
}

/**
 * Generates improvement instructions for regeneration
 */
export async function getImprovementInstructions(score: QualityScore): Promise<string> {
  const instructions: string[] = [];
  
  if (score.specificity < 50) {
    instructions.push("Include more specific technologies, tools, and metrics from the source");
  }
  
  if (score.engagement < 50) {
    instructions.push("Add stronger hooks, questions, and clear CTAs");
  }
  
  if (score.value < 50) {
    instructions.push("Focus more on benefits, outcomes, and actionable insights");
  }
  
  // Add top 3 suggestions
  if (score.suggestions && Array.isArray(score.suggestions) && score.suggestions.length > 0) {
    instructions.push(...score.suggestions.slice(0, 3));
  }
  
  return instructions.join(". ");
}