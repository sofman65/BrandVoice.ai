import { db } from "./index";
import { missions } from "./schema";
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
    userId: "test_user_1", // We'll replace this with real user IDs
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
    userId: "test_user_1",
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
    userId: "test_user_1",
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
      console.log(`✅ Inserted: ${mission.title}`);
    }
    
    console.log(`✅ Seeded ${sampleMissions.length} missions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedMissions().then(() => process.exit(0));
}
