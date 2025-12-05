"use server";
import "server-only";

import { getOpenAI, withTimeout } from "./openai-client";

export interface ExtractedConcepts {
  mainTopics: string[];
  technologies: string[];
  keyPoints: string[];
  problems: string[];
  solutions: string[];
  benefits: string[];
  targetAudience: string;
  uniqueValue: string;
  hooks: string[];
  statistics: string[];
  actionableInsights: string[];
}

/**
 * Analyzes source content to extract key concepts, technologies, and value propositions
 * This provides context for more specific and valuable content generation
 */
export async function analyzeContent(
  caption: string,
  transcript?: string,
  voice?: { audience?: string }
): Promise<ExtractedConcepts> {
  const openai = await getOpenAI();
  
  if (!openai || !process.env.OPENAI_API_KEY) {
    // Return basic extraction in mock mode
    return getFallbackConcepts(caption, transcript);
  }

  const combinedContent = transcript 
    ? `CAPTION/DESCRIPTION:\n${caption}\n\nTRANSCRIPT:\n${transcript}`
    : caption;

  const systemPrompt = `You are an expert content analyst specializing in extracting actionable insights from social media and video content.

Your task is to analyze the provided content and extract specific, valuable concepts that can be used to create engaging social media posts.

Focus on:
1. Identifying specific technologies, tools, and platforms mentioned
2. Extracting concrete problems being solved
3. Finding measurable benefits and outcomes
4. Identifying the target audience and their pain points
5. Pulling out statistics, numbers, and data points
6. Creating compelling hooks from the most interesting aspects

Return a JSON object with these exact fields:
{
  "mainTopics": ["specific topic 1", "specific topic 2"],
  "technologies": ["tool/platform/framework mentioned"],
  "keyPoints": ["specific learning or insight"],
  "problems": ["pain point or challenge addressed"],
  "solutions": ["how the problem is solved"],
  "benefits": ["measurable outcome or benefit"],
  "targetAudience": "who would benefit most from this content",
  "uniqueValue": "what makes this content special or different",
  "hooks": ["attention-grabbing opening lines based on the content"],
  "statistics": ["any numbers, percentages, or metrics mentioned"],
  "actionableInsights": ["specific things the audience can do"]
}

Be SPECIFIC. Extract actual details from the content, not generic statements.`;

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this content for key concepts:\n\n${combinedContent}` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
      20000,
      "Content analysis"
    );

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new Error("No analysis result");

    const parsed = JSON.parse(result) as ExtractedConcepts;
    
    // Ensure all arrays have at least one item
    return {
      mainTopics: parsed.mainTopics?.length ? parsed.mainTopics : ["Content creation"],
      technologies: parsed.technologies?.length ? parsed.technologies : [],
      keyPoints: parsed.keyPoints?.length ? parsed.keyPoints : ["Key insights from the content"],
      problems: parsed.problems?.length ? parsed.problems : ["Creating engaging content"],
      solutions: parsed.solutions?.length ? parsed.solutions : ["Strategic content approach"],
      benefits: parsed.benefits?.length ? parsed.benefits : ["Improved engagement"],
      targetAudience: parsed.targetAudience || voice?.audience || "Content creators and marketers",
      uniqueValue: parsed.uniqueValue || "Unique insights and practical strategies",
      hooks: parsed.hooks?.length ? parsed.hooks : ["Discover how to transform your content strategy"],
      statistics: parsed.statistics?.length ? parsed.statistics : [],
      actionableInsights: parsed.actionableInsights?.length ? parsed.actionableInsights : ["Apply these strategies to your content"]
    };
  } catch (error) {
    console.error("Content analysis failed:", error);
    return getFallbackConcepts(caption, transcript);
  }
}

/**
 * Generates fallback concepts when AI analysis fails
 */
function getFallbackConcepts(caption: string, transcript?: string): ExtractedConcepts {
  // Extract potential technologies from common patterns
  const techPatterns = /\b(React|Vue|Angular|Next\.js|Nuxt|Gatsby|TypeScript|JavaScript|Python|Node|Express|Django|Flask|AWS|Azure|GCP|Docker|Kubernetes|GraphQL|REST|API|Tailwind|CSS|HTML|Shopify|WordPress|Laravel|Rails|MongoDB|PostgreSQL|MySQL|Redis|Firebase)\b/gi;
  const technologies = [...new Set((caption + (transcript || "")).match(techPatterns) || [])];

  // Extract numbers and percentages
  const statPatterns = /\b\d+%|\b\d+x\b|\$\d+|\d+\s*(hours?|minutes?|seconds?|days?|weeks?|months?|years?)\b/gi;
  const statistics = [...new Set((caption + (transcript || "")).match(statPatterns) || [])];

  return {
    mainTopics: ["Content strategy", "Digital transformation"],
    technologies: technologies.slice(0, 5),
    keyPoints: ["Practical implementation strategies", "Real-world examples", "Expert insights"],
    problems: ["Time-consuming content creation", "Low engagement rates", "Inconsistent brand voice"],
    solutions: ["Streamlined workflows", "AI-powered optimization", "Strategic content planning"],
    benefits: ["Save time on content creation", "Increase engagement rates", "Build consistent brand presence"],
    targetAudience: "Content creators, marketers, and developers",
    uniqueValue: "Practical, actionable strategies you can implement today",
    hooks: [
      "Stop wasting hours on content that doesn't convert",
      "The strategy that transformed our engagement rates",
      "What top creators know that you don't"
    ],
    statistics: statistics.slice(0, 3),
    actionableInsights: [
      "Implement these strategies in your next post",
      "Start with one technique and scale from there",
      "Measure results and iterate quickly"
    ]
  };
}

/**
 * Formats extracted concepts into a readable summary for prompt inclusion
 */
export async function formatConceptsForPrompt(concepts: ExtractedConcepts): Promise<string> {
  const sections = [];

  if (concepts.mainTopics.length > 0) {
    sections.push(`MAIN TOPICS: ${concepts.mainTopics.join(", ")}`);
  }

  if (concepts.technologies.length > 0) {
    sections.push(`TECHNOLOGIES: ${concepts.technologies.join(", ")}`);
  }

  if (concepts.problems.length > 0) {
    sections.push(`PROBLEMS ADDRESSED: ${concepts.problems.slice(0, 3).join("; ")}`);
  }

  if (concepts.benefits.length > 0) {
    sections.push(`KEY BENEFITS: ${concepts.benefits.slice(0, 3).join("; ")}`);
  }

  if (concepts.statistics.length > 0) {
    sections.push(`DATA POINTS: ${concepts.statistics.join(", ")}`);
  }

  sections.push(`TARGET AUDIENCE: ${concepts.targetAudience}`);
  sections.push(`UNIQUE VALUE: ${concepts.uniqueValue}`);

  if (concepts.hooks.length > 0) {
    sections.push(`POTENTIAL HOOKS: ${concepts.hooks.slice(0, 2).join(" | ")}`);
  }

  return sections.join("\n");
}