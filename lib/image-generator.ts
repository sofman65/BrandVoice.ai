"use server"
import "server-only"
import { CarouselSlide } from "./types"
import { sleep } from "./utils"
import path from "path"
import fs from "fs/promises"

/**
 * Generate image prompts for carousel slides
 */
export async function generateImagePrompts(slides: CarouselSlide[]): Promise<CarouselSlide[]> {
    // Get OpenAI client
    const { getOpenAI } = await import("./openai")
    const openai = await getOpenAI()

    if (!openai || !process.env.OPENAI_API_KEY) {
        console.log("OpenAI not configured, skipping image prompt generation")
        // Return slides with mock image prompts in mock mode
        return slides.map((slide) => {
            if (typeof slide === 'string') {
                return {
                    heading: "Slide Heading",
                    body: slide,
                    imagePrompt: "A futuristic space technology visualization with glowing blue elements"
                }
            }

            return {
                ...slide,
                imagePrompt: slide.imagePrompt || `A futuristic visualization of ${slide.heading?.toLowerCase() || 'space technology'} with glowing elements`
            }
        })
    }

    try {
        // For each slide, generate an image prompt
        const slidesWithPrompts = await Promise.all(slides.map(async (slide, index) => {
            try {
                if (typeof slide === 'string') {
                    // Convert string slides to objects with heading, body, and image prompt
                    const imagePrompt = await generatePromptForSlide(slide, index, openai)
                    return {
                        heading: "Slide " + (index + 1),
                        body: slide,
                        imagePrompt
                    }
                } else {
                    // Generate image prompt if it doesn't exist
                    if (!slide.imagePrompt) {
                        const slideContent = `Heading: ${slide.heading || ''}\nBody: ${slide.body || ''}`
                        const imagePrompt = await generatePromptForSlide(slideContent, index, openai)
                        return {
                            ...slide,
                            imagePrompt
                        }
                    }
                    return slide
                }
            } catch (error) {
                console.error(`Error generating prompt for slide ${index}:`, error)
                // Return the original slide if there's an error
                return typeof slide === 'string'
                    ? { heading: "Slide " + (index + 1), body: slide }
                    : slide
            }
        }))

        return slidesWithPrompts
    } catch (error) {
        console.error("Error generating image prompts:", error)
        // Return original slides on error
        return slides
    }
}

/**
 * Generate an image prompt for a single slide
 */
async function generatePromptForSlide(slideContent: string, slideIndex: number, openai: any): Promise<string> {
    const slidePosition = getSlidePosition(slideIndex)
    
    // Determine the type of visual based on slide position and content
    const visualStyle = getVisualStyleForSlide(slideIndex, slideContent)
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Upgraded for better prompt generation
        messages: [
            {
                role: "system",
                content: `You are an expert at creating image prompts for Instagram carousel slides about technology and business.
Your job is to create a detailed, specific image prompt that matches the slide's content and position in the carousel.

VISUAL STYLE GUIDELINES:
${visualStyle}

REQUIREMENTS:
- Be specific to the actual content (mention technologies, concepts, or metaphors from the text)
- Use rich visual descriptions (colors, lighting, composition, style)
- Match the emotional tone (problem = darker/urgent, solution = bright/optimistic, CTA = inspiring/actionable)
- Professional and modern aesthetic
- 1-2 sentences, 50-100 words
- NO text overlays or words in the image
- Focus on metaphorical or conceptual representations, not literal interpretations`
            },
            {
                role: "user",
                content: `Create an image prompt for this ${slidePosition} carousel slide:

${slideContent}

The image should visually represent the concept without using any text.
Return ONLY the prompt text, nothing else.`
            }
        ],
        temperature: 0.8,
        max_tokens: 150,
    })

    const prompt = completion.choices[0]?.message?.content?.trim() ||
        getFallbackPromptForSlide(slideIndex, slideContent)

    return prompt
}

/**
 * Determines the visual style based on slide position and content
 */
function getVisualStyleForSlide(index: number, content: string): string {
    const contentLower = content.toLowerCase()
    
    // Slide 1: Hook/Problem
    if (index === 0) {
        if (contentLower.includes("problem") || contentLower.includes("mistake") || contentLower.includes("wrong")) {
            return "Style: Dramatic contrast, darker tones with a single bright element representing hope/solution. Visual metaphor for the problem being addressed."
        }
        return "Style: Eye-catching, high contrast, bold composition. Use visual metaphors for transformation or breakthrough."
    }
    
    // Slides 2-3: Value/Benefits
    if (index >= 1 && index <= 3) {
        if (contentLower.includes("data") || contentLower.includes("%") || contentLower.includes("number")) {
            return "Style: Clean, data-visualization inspired, geometric patterns or abstract charts. Bright, optimistic colors."
        }
        if (contentLower.includes("tool") || contentLower.includes("technology") || contentLower.includes("framework")) {
            return "Style: Technical but approachable, circuit-board patterns, code-inspired visuals, or tool metaphors. Modern tech aesthetic."
        }
        return "Style: Uplifting, progressive, showing growth or improvement. Use ascending elements, bright gradients."
    }
    
    // Slide 4-5: CTA/Next Steps
    if (index >= 4) {
        return "Style: Inspiring and actionable, forward-motion elements like arrows or paths. Warm, inviting colors that encourage action."
    }
    
    return "Style: Modern, professional, clean composition with appropriate visual metaphors for the content."
}

/**
 * Generates a fallback prompt when API fails
 */
function getFallbackPromptForSlide(index: number, content: string): string {
    const contentLower = content.toLowerCase()
    
    // Extract potential technologies or concepts
    const techMatch = content.match(/\b(React|Vue|Angular|Next\.js|Nuxt|TypeScript|JavaScript|Python|Node|API|GraphQL|CSS|HTML|AI|ML|database|cloud|mobile|web|app)\b/gi)
    const tech = techMatch ? techMatch[0] : "technology"
    
    const prompts = [
        `A striking abstract visualization of ${tech} concepts with interconnected nodes and flowing data streams, vibrant purple and blue gradient, modern tech aesthetic`,
        `Clean geometric patterns representing ${tech} architecture, minimalist design with bold accent colors, professional and modern`,
        `Abstract representation of growth and optimization in ${tech}, ascending elements with bright gradient from orange to yellow, inspiring composition`,
        `Dynamic visualization of problem-solving with ${tech}, contrast between dark challenges and bright solutions, dramatic lighting`,
        `Forward-moving abstract elements suggesting progress and action with ${tech}, warm inviting colors, path leading to success`
    ]
    
    return prompts[Math.min(index, prompts.length - 1)]
}

/**
 * Get the slide position descriptor (first, second, etc.)
 */
function getSlidePosition(index: number): string {
    const positions = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"]
    return positions[index] || `${index + 1}th`
}

/**
 * Generate images for carousel slides
 */
type ImageStorageMode = "fs" | "data";

export async function generateImagesForSlides(
    slides: CarouselSlide[],
    options?: { storage?: ImageStorageMode; concurrency?: number; timeoutMs?: number }
): Promise<CarouselSlide[]> {
    // Get OpenAI client
    const { getOpenAI } = await import("./openai")
    const openai = await getOpenAI()

    if (!openai || !process.env.OPENAI_API_KEY) {
        console.log("OpenAI not configured, using placeholder images")
        // Return slides with placeholder image URLs in mock mode
        return slides.map((slide, index) => {
            if (typeof slide === 'string') {
                return {
                    heading: "Slide Heading",
                    body: slide,
                    imageUrl: `/placeholder-${(index % 5) + 1}.jpg`
                }
            }

            return {
                ...slide,
                imageUrl: slide.imageUrl || `/placeholder-${(index % 5) + 1}.jpg`
            }
        })
    }

    const storageMode: ImageStorageMode = options?.storage
        || (process.env.VERCEL ? "data" : "fs")
    const concurrency = Math.max(1, Math.min(options?.concurrency ?? 2, 5))
    const timeoutMs = Math.max(10_000, options?.timeoutMs ?? 45_000)

    let imageDir = ""
    if (storageMode === "fs") {
        // Ensure image directory exists (local/dev only)
        const publicDir = path.join(process.cwd(), "public")
        imageDir = path.join(publicDir, "generated-images")
        await fs.mkdir(imageDir, { recursive: true })
    }

    // Helper: run with timeout
    const withTimeout = async <T>(p: Promise<T>): Promise<T> => {
        return await Promise.race<T>([
            p,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error("image_generation_timeout")), timeoutMs)) as Promise<T>,
        ])
    }

    // Worker function for a single slide
    const processOne = async (slide: CarouselSlide, index: number): Promise<CarouselSlide> => {
        try {
            // Skip if already has an image URL
            if (typeof slide !== 'string' && slide.imageUrl) {
                return slide
            }

            // Get the image prompt
            const slideObj = typeof slide === 'string'
                ? { heading: "Slide " + (index + 1), body: slide }
                : slide

            // Generate image prompt if needed
            if (typeof slideObj !== 'string' && !slideObj.imagePrompt) {
                const slidesWithPrompts = await generateImagePrompts([slideObj])
                if (slidesWithPrompts[0] && typeof slidesWithPrompts[0] !== 'string' && 'imagePrompt' in slidesWithPrompts[0]) {
                    slideObj.imagePrompt = (slidesWithPrompts[0] as { imagePrompt?: string }).imagePrompt
                }
            }

            // Call DALL-E to generate image
            const response = await withTimeout(openai.images.generate({
                model: "dall-e-3",
                prompt: slideObj.imagePrompt || `A futuristic visualization of space technology, slide ${index + 1}`,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "b64_json",
            }))

            const imageData = response.data && response.data[0]?.b64_json
            if (!imageData) {
                return slideObj
            }

            // Persist based on storage mode
            if (storageMode === "fs") {
                const timestamp = Date.now()
                const imageFilename = `slide-${index + 1}-${timestamp}.png`
                const imagePath = path.join(imageDir, imageFilename)
                const buffer = Buffer.from(imageData, 'base64')
                await fs.writeFile(imagePath, buffer)
                const imageUrl = `/generated-images/${imageFilename}`
                return { ...slideObj, imageUrl }
            } else {
                const dataUrl = `data:image/png;base64,${imageData}`
                return { ...slideObj, imageUrl: dataUrl }
            }
        } catch (error) {
            console.error(`Error generating image for slide ${index}:`, error)
            // Return the original slide if there's an error
            return typeof slide === 'string'
                ? { heading: "Slide " + (index + 1), body: slide }
                : slide
        }
    }

    // Run with limited concurrency
    const results: CarouselSlide[] = []
    let i = 0
    async function runNext(): Promise<void> {
        const current = i++
        if (current >= slides.length) return
        const result = await processOne(slides[current], current)
        results[current] = result
        await runNext()
    }
    const workers = Array.from({ length: Math.min(concurrency, slides.length) }, () => runNext())
    await Promise.all(workers)

    return results
}
