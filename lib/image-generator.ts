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

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert at creating image prompts for carousel slides about space technology and innovation.
Your job is to create a detailed, vivid image prompt that would work well with DALL-E 3 to create a beautiful, 
engaging image for a carousel slide. The prompt should:
- Be descriptive and visual (colors, lighting, style, composition)
- Match the content and emotion of the slide
- Have a consistent futuristic, space-tech aesthetic
- Be appropriate for a professional audience
- Be 1-2 sentences (50-100 words max)
- NOT include text overlays (no words in the image)
- Focus on abstract, conceptual visualizations that represent the ideas, not literal text`
            },
            {
                role: "user",
                content: `Create an image prompt for this ${slidePosition} carousel slide for a space technology company:

${slideContent}

Return ONLY the prompt text, nothing else.`
            }
        ],
        temperature: 0.7,
        max_tokens: 150,
    })

    const prompt = completion.choices[0]?.message?.content?.trim() ||
        `A futuristic visualization of space technology with glowing elements, slide ${slideIndex + 1}`

    return prompt
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
export async function generateImagesForSlides(slides: CarouselSlide[]): Promise<CarouselSlide[]> {
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

    // Ensure image directory exists
    const publicDir = path.join(process.cwd(), "public")
    const imageDir = path.join(publicDir, "generated-images")
    await fs.mkdir(imageDir, { recursive: true })

    // Generate images for each slide
    const slidesWithImages = await Promise.all(slides.map(async (slide, index) => {
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

            // Generate the image
            const timestamp = Date.now()
            const imageFilename = `slide-${index + 1}-${timestamp}.png`
            const imagePath = path.join(imageDir, imageFilename)
            const imageUrl = `/generated-images/${imageFilename}`

            // Call DALL-E to generate image
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: slideObj.imagePrompt || `A futuristic visualization of space technology, slide ${index + 1}`,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "b64_json",
            })

            // Save the image
            const imageData = response.data && response.data[0]?.b64_json
            if (imageData) {
                const buffer = Buffer.from(imageData, 'base64')
                await fs.writeFile(imagePath, buffer)

                // Add the image URL to the slide
                return {
                    ...slideObj,
                    imageUrl
                }
            }

            return slideObj
        } catch (error) {
            console.error(`Error generating image for slide ${index}:`, error)
            // Return the original slide if there's an error
            return typeof slide === 'string'
                ? { heading: "Slide " + (index + 1), body: slide }
                : slide
        }
    }))

    return slidesWithImages
}
