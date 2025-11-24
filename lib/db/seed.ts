import { db } from "./index";
import { missions, voices, presets } from "./schema";
import { eq } from "drizzle-orm";
// drizzle-orm/neon-http requires simple JSON bodies; ensure outputs is a plain object

// Helper function to generate IDs (from store.ts)
function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return Math.random().toString(36).slice(2);
}

// Sample mission data
const sampleMissions = [
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc", // Replace with your actual Clerk user ID
    title: "16 Cool GitHub Repos",
    platform: "youtube" as const,
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    pinned: true,
    createdAt: new Date(Date.now() - 3600_000 * 6),
    outputs: {
      linkedin: "🚀 16 Cool GitHub Repos\n\nHere are the key insights and takeaways tailored for LinkedIn readers. Add your POV and invite discussion. #BrandVoiceAI",
      carousel: [
        { slide: 1, text: "16 Cool GitHub Repos – Slide 1: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 1 with purple neon glow" },
        { slide: 2, text: "16 Cool GitHub Repos – Slide 2: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 2 with purple neon glow" },
        { slide: 3, text: "16 Cool GitHub Repos – Slide 3: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 3 with purple neon glow" },
        { slide: 4, text: "16 Cool GitHub Repos – Slide 4: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 4 with purple neon glow" },
        { slide: 5, text: "16 Cool GitHub Repos – Slide 5: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 5 with purple neon glow" }
      ],
      threads: "16 Cool GitHub Repos — quick takeaway in <= 500 chars. Keep it conversational and actionable. #BrandVoiceAI",
      videoScript: "00:00 Intro — Hook with the core promise\n00:10 Point 1 — Practical value for the audience\n00:25 Point 2 — Supporting example\n00:40 CTA — Invite comments and follows"
    }
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    title: "Creator Mindset Tips",
    platform: "instagram" as const,
    sourceUrl: "https://www.instagram.com/p/ABC123/",
    pinned: false,
    createdAt: new Date(Date.now() - 3600_000 * 12),
    outputs: {
      linkedin: "🚀 Creator Mindset Tips\n\nHere are the key insights and takeaways tailored for LinkedIn readers. Add your POV and invite discussion. #BrandVoiceAI",
      carousel: [
        { slide: 1, text: "Creator Mindset Tips – Slide 1: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 1 with purple neon glow" },
        { slide: 2, text: "Creator Mindset Tips – Slide 2: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 2 with purple neon glow" },
        { slide: 3, text: "Creator Mindset Tips – Slide 3: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 3 with purple neon glow" },
        { slide: 4, text: "Creator Mindset Tips – Slide 4: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 4 with purple neon glow" },
        { slide: 5, text: "Creator Mindset Tips – Slide 5: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 5 with purple neon glow" }
      ],
      threads: "Creator Mindset Tips — quick takeaway in <= 500 chars. Keep it conversational and actionable. #BrandVoiceAI",
      videoScript: "00:00 Intro — Hook with the core promise\n00:10 Point 1 — Practical value for the audience\n00:25 Point 2 — Supporting example\n00:40 CTA — Invite comments and follows"
    }
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    title: "Batch Like a Pro",
    platform: "youtube" as const,
    sourceUrl: "https://youtu.be/abcdefghijk",
    pinned: false,
    createdAt: new Date(Date.now() - 3600_000 * 24),
    outputs: {
      linkedin: "🚀 Batch Like a Pro\n\nHere are the key insights and takeaways tailored for LinkedIn readers. Add your POV and invite discussion. #BrandVoiceAI",
      carousel: [
        { slide: 1, text: "Batch Like a Pro – Slide 1: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 1 with purple neon glow" },
        { slide: 2, text: "Batch Like a Pro – Slide 2: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 2 with purple neon glow" },
        { slide: 3, text: "Batch Like a Pro – Slide 3: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 3 with purple neon glow" },
        { slide: 4, text: "Batch Like a Pro – Slide 4: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 4 with purple neon glow" },
        { slide: 5, text: "Batch Like a Pro – Slide 5: concise, value-focused point for Instagram carousel.", imagePrompt: "Futuristic space-tech visualization for slide 5 with purple neon glow" }
      ],
      threads: "Batch Like a Pro — quick takeaway in <= 500 chars. Keep it conversational and actionable. #BrandVoiceAI",
      videoScript: "00:00 Intro — Hook with the core promise\n00:10 Point 1 — Practical value for the audience\n00:25 Point 2 — Supporting example\n00:40 CTA — Invite comments and follows"
    }
  }
];

// Sample voice data
const sampleVoices = [
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Professional Tech Voice",
    tone: "professional, friendly, authoritative",
    style: "clear, actionable, value-focused",
    vocabulary: "technical terms, industry jargon, plain language explanations",
    audience: "developers, tech professionals, startup founders",
    cta: "invite conversation and engagement, not salesy",
    hashtags: "#TechTips #Development #StartupLife #Innovation",
    createdAt: new Date(Date.now() - 3600_000 * 2),
    updatedAt: new Date(Date.now() - 3600_000 * 1),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc", 
    name: "Casual Creator Voice",
    tone: "casual, enthusiastic, relatable",
    style: "conversational, storytelling, personal",
    vocabulary: "everyday language, minimal jargon, emojis",
    audience: "content creators, social media enthusiasts, young professionals",
    cta: "encourage shares and comments, build community",
    hashtags: "#CreatorLife #ContentTips #SocialMedia #Community",
    createdAt: new Date(Date.now() - 3600_000 * 4),
    updatedAt: new Date(Date.now() - 3600_000 * 2),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Business Executive Voice", 
    tone: "confident, strategic, inspiring",
    style: "executive summary, data-driven, visionary",
    vocabulary: "business terminology, metrics, strategic concepts",
    audience: "executives, business leaders, investors",
    cta: "drive action and decision-making, thought leadership",
    hashtags: "#Leadership #Business #Strategy #Growth",
    createdAt: new Date(Date.now() - 3600_000 * 6),
    updatedAt: new Date(Date.now() - 3600_000 * 3),
  }
];

// Sample preset data
const samplePresets = [
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Make it Viral",
    description: "Add viral hooks and engagement tactics",
    content: "Add a compelling hook in the first 3 seconds. Use pattern interrupts, controversial takes (when appropriate), and strong emotional triggers. Include interactive elements like polls or questions. End with a strong CTA that encourages sharing.",
    createdAt: new Date(Date.now() - 3600_000 * 1),
    updatedAt: new Date(Date.now() - 3600_000 * 1),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Add Humor",
    description: "Inject appropriate humor and wit",
    content: "Add light humor, witty observations, or clever wordplay where appropriate. Use relatable analogies, gentle self-deprecation, or industry inside jokes. Keep it professional but entertaining. Avoid offensive content.",
    createdAt: new Date(Date.now() - 3600_000 * 3),
    updatedAt: new Date(Date.now() - 3600_000 * 2),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Data-Driven Focus",
    description: "Emphasize statistics and concrete evidence",
    content: "Include relevant statistics, research findings, or concrete data points. Use numbers to strengthen arguments. Reference credible sources. Present information in a logical, evidence-based structure. Add charts or data visualization suggestions where helpful.",
    createdAt: new Date(Date.now() - 3600_000 * 5),
    updatedAt: new Date(Date.now() - 3600_000 * 4),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Personal Story Angle",
    description: "Add personal anecdotes and storytelling elements",
    content: "Incorporate personal experiences, lessons learned, or behind-the-scenes insights. Use storytelling frameworks like problem-solution or before-after. Make it relatable and authentic. Share failures and successes equally.",
    createdAt: new Date(Date.now() - 3600_000 * 7),
    updatedAt: new Date(Date.now() - 3600_000 * 5),
  },
  {
    id: generateId(),
    userId: "user_31EAMYuMrjnhgdOWypltJPJMxHc",
    name: "Controversy & Debate",
    description: "Present contrarian views to spark discussion",
    content: "Present a contrarian or unconventional perspective on the topic. Challenge common assumptions respectfully. Invite debate and discussion. Use phrases like 'Unpopular opinion:' or 'Here's why everyone is wrong about X'. Back up controversial takes with reasoning.",
    createdAt: new Date(Date.now() - 3600_000 * 8),
    updatedAt: new Date(Date.now() - 3600_000 * 6),
  }
];

export async function seedMissions() {
  if (!db) {
    console.log("❌ Database not configured");
    return;
  }

  try {
    console.log("🌱 Seeding missions table...");
    // Upsert-like behavior: delete any existing with same id first to avoid conflicts
    for (const mission of sampleMissions) {
      try {
        // best-effort cleanup for repeated runs
        await db.delete(missions).where(eq(missions.id, mission.id));
      } catch {}
      await db.insert(missions).values({
        ...mission,
        // Ensure outputs is serialized to plain JSON
        outputs: JSON.parse(JSON.stringify(mission.outputs)),
      });
      console.log(`✅ Inserted mission: ${mission.title}`);
    }
    
    console.log(`✅ Seeded ${sampleMissions.length} missions`);
  } catch (error) {
    console.error("❌ Missions seeding failed:", error);
  }
}

export async function seedVoices() {
  if (!db) {
    console.log("❌ Database not configured");
    return;
  }

  try {
    console.log("🌱 Seeding voices table...");
    for (const voice of sampleVoices) {
      try {
        // best-effort cleanup for repeated runs
        await db.delete(voices).where(eq(voices.id, voice.id));
      } catch {}
      await db.insert(voices).values(voice);
      console.log(`✅ Inserted voice: ${voice.name}`);
    }
    
    console.log(`✅ Seeded ${sampleVoices.length} voices`);
  } catch (error) {
    console.error("❌ Voices seeding failed:", error);
  }
}

export async function seedPresets() {
  if (!db) {
    console.log("❌ Database not configured");
    return;
  }

  try {
    console.log("🌱 Seeding presets table...");
    for (const preset of samplePresets) {
      try {
        // best-effort cleanup for repeated runs
        await db.delete(presets).where(eq(presets.id, preset.id));
      } catch {}
      await db.insert(presets).values(preset);
      console.log(`✅ Inserted preset: ${preset.name}`);
    }
    
    console.log(`✅ Seeded ${samplePresets.length} presets`);
  } catch (error) {
    console.error("❌ Presets seeding failed:", error);
  }
}

export async function seedAll() {
  console.log("🌱 Starting database seeding...");
  await seedMissions();
  await seedVoices(); 
  await seedPresets();
  console.log("✅ Database seeding completed!");
}

// Run seed if called directly
if (require.main === module) {
  seedAll().then(() => process.exit(0));
}
