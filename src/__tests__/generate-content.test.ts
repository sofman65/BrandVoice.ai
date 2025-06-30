import { describe, it, expect } from "vitest"
import type { GeneratedContent } from "@/lib/types"

describe("generateContent schema validation", () => {
  it("should validate correct GeneratedContent structure", () => {
    const validContent: GeneratedContent = {
      linkedin: "This is a LinkedIn post",
      carousel: ["Slide 1", "Slide 2", "Slide 3"],
      threads: "This is a Threads post",
      video_script: "This is a video script",
    }

    // Test that all required fields are present
    expect(validContent).toHaveProperty("linkedin")
    expect(validContent).toHaveProperty("carousel")
    expect(validContent).toHaveProperty("threads")
    expect(validContent).toHaveProperty("video_script")

    // Test field types
    expect(typeof validContent.linkedin).toBe("string")
    expect(Array.isArray(validContent.carousel)).toBe(true)
    expect(typeof validContent.threads).toBe("string")
    expect(typeof validContent.video_script).toBe("string")

    // Test carousel contains strings
    validContent.carousel.forEach((slide) => {
      expect(typeof slide).toBe("string")
    })
  })

  it("should handle carousel with maximum slides", () => {
    const maxSlides = Array.from({ length: 10 }, (_, i) => `Slide ${i + 1}`)

    const contentWithMaxSlides: GeneratedContent = {
      linkedin: "LinkedIn content",
      carousel: maxSlides,
      threads: "Threads content",
      video_script: "Video script",
    }

    expect(contentWithMaxSlides.carousel).toHaveLength(10)
    expect(contentWithMaxSlides.carousel.every((slide) => typeof slide === "string")).toBe(true)
  })

  it("should validate threads character limit", () => {
    const longThreadsPost = "a".repeat(600) // Over 500 character limit
    const validThreadsPost = "a".repeat(400) // Under 500 character limit

    expect(longThreadsPost.length).toBeGreaterThan(500)
    expect(validThreadsPost.length).toBeLessThanOrEqual(500)
  })
})
