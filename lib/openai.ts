import type { GeneratedContent } from "./types"

let openaiClient: any = null

async function getOpenAIClient() {
  if (!openaiClient) {
    try {
      const { OpenAI } = await import("openai")
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } catch (error) {
      console.error("Failed to initialize OpenAI client:", error)
      throw new Error("OpenAI client initialization failed")
    }
  }
  return openaiClient
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Mock transcription: This is a sample audio transcription for development purposes."
  }

  try {
    const client = await getOpenAIClient()
    const response = await client.audio.transcriptions.create({
      file: audioUrl,
      model: "whisper-1",
    })
    return response.text
  } catch (error) {
    console.error("Transcription error:", error)
    return "Transcription failed. Using original caption instead."
  }
}

export async function generateContent(caption: string, transcript?: string): Promise<GeneratedContent> {
  if (!process.env.OPENAI_API_KEY) {
    // Return mock data for development
    return {
      linkedin: `🚀 Exciting developments in the tech space! 

${caption}

What are your thoughts on this innovation? Let's discuss in the comments!

#TechInnovation #DigitalTransformation #FutureOfWork #TechTrends #Innovation`,

      carousel: [
        "🌟 The Future is Here! Discover what's changing the game in tech...",
        "💡 Innovation Spotlight: Here's what caught our attention and why it matters...",
        "🔥 Game-Changing Technology: This breakthrough is revolutionizing how we work...",
        "⚡ Why This Matters: The impact on businesses and creators is massive...",
        "🚀 Ready to Level Up? Here's how you can get started with this technology...",
      ],

      threads: `Just discovered something incredible in the tech world! 🤯

${caption.slice(0, 200)}...

The possibilities are endless. What do you think about this development? 

#TechTalk #Innovation`,

      video_script: `[HOOK - 0-3 seconds]
🎬 VISUAL: Close-up of excited face
🗣️ SCRIPT: "You won't believe what just happened in tech!"

[PROBLEM/SETUP - 3-8 seconds]
🎬 VISUAL: Show the technology/innovation
🗣️ SCRIPT: "${caption.slice(0, 100)}..."

[SOLUTION/REVEAL - 8-20 seconds]
🎬 VISUAL: Demonstrate the technology in action
🗣️ SCRIPT: "Here's why this changes everything..."

[CALL TO ACTION - 20-30 seconds]
🎬 VISUAL: Direct to camera
🗣️ SCRIPT: "Follow for more tech insights! What do you think about this? Comment below!"

[END SCREEN]
🎬 VISUAL: Subscribe/Follow animation
🗣️ SCRIPT: "Don't miss the next breakthrough!"`,
    }
  }

  try {
    const client = await getOpenAIClient()
    const content = transcript ? `${caption}\n\nTranscript: ${transcript}` : caption

    const systemPrompt = `You are Spaceslam's AI content creator. Spaceslam is a space-tech company with an energetic, innovative, and slightly humorous brand voice. 

Create content that is:
- Energetic and space-tech focused
- Professional but approachable
- Engaging and shareable
- Optimized for each platform's audience

Return ONLY valid JSON in this exact format:
{
  "linkedin": "Professional LinkedIn post with hashtags",
  "carousel": ["slide 1 text", "slide 2 text", "slide 3 text", "slide 4 text", "slide 5 text"],
  "threads": "Conversational Threads post under 500 characters",
  "video_script": "Complete video script with visual cues and timing"
}`

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transform this Instagram content: ${content}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error("No content generated")
    }

    try {
      return JSON.parse(result) as GeneratedContent
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", result)
      throw new Error("Invalid response format from AI")
    }
  } catch (error) {
    console.error("Content generation error:", error)
    throw new Error("Failed to generate content")
  }
}
