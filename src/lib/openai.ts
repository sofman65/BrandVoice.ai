import OpenAI from "openai"
import type { GeneratedContent } from "./types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // In a real implementation, you'd download the audio file first
    // For now, return mock transcript
    return "This is a mock transcript of the video content discussing space technology and innovation."
  } catch (error) {
    console.error("Error transcribing audio:", error)
    throw new Error("Failed to transcribe audio")
  }
}

export async function generateContent(caption: string, transcript?: string): Promise<GeneratedContent> {
  const systemPrompt = `You are Spaceslam's content repurposing AI. Your tone is energetic, space-tech savvy, with a bit of humor. 
  Transform the given Instagram content into multi-channel formats while maintaining the Spaceslam brand voice.
  
  Return ONLY a valid JSON object with this exact structure:
  {
    "linkedin": "Professional LinkedIn post (200-300 words)",
    "carousel": ["Slide 1 text", "Slide 2 text", "Slide 3 text", "Slide 4 text", "Slide 5 text"],
    "threads": "Threads post (under 500 characters)",
    "video_script": "Video script with speaker cues and shots"
  }`

  const userPrompt = `Original Instagram caption: "${caption}"${transcript ? `\n\nVideo transcript: "${transcript}"` : ""}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content generated from OpenAI")
    }

    // Try to parse the JSON response
    let parsedContent
    try {
      parsedContent = JSON.parse(content) as GeneratedContent
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", content)
      throw new Error("OpenAI returned invalid JSON format")
    }

    // Validate the structure
    if (!parsedContent.linkedin || !parsedContent.carousel || !parsedContent.threads || !parsedContent.video_script) {
      throw new Error("OpenAI response missing required fields")
    }

    if (!Array.isArray(parsedContent.carousel)) {
      throw new Error("Carousel field must be an array")
    }

    return parsedContent
  } catch (error) {
    console.error("Error in generateContent:", error)

    if (error instanceof Error) {
      // Re-throw with more specific error messages
      if (error.message.includes("API key")) {
        throw new Error("Invalid OpenAI API key")
      }
      if (error.message.includes("quota")) {
        throw new Error("OpenAI API quota exceeded")
      }
      if (error.message.includes("rate limit")) {
        throw new Error("OpenAI API rate limit exceeded")
      }
    }

    throw new Error("Failed to generate content with AI")
  }
}
