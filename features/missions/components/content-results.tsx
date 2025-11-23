"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { VoiceAlertBanner } from "@/features/voices/components/voice-alert-banner"
import { Linkedin, Instagram, MessageCircle, Video, ImageIcon } from "lucide-react"
import type { GeneratedContent, CarouselSlide } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import { readableSlide, getSlideImage } from "@/lib/utils"

// Helper to extract image prompt
const getSlideImagePrompt = (slide: CarouselSlide): string | null =>
  typeof slide === "string" ? null : slide.imagePrompt || null

interface ContentResultsProps {
  data: GeneratedContent
}

export function ContentResults({ data }: ContentResultsProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(data.carousel)
  const [isGenerating, setIsGenerating] = useState(false)

  const anyMissingImages = slides.some((s) => typeof s !== "string" && !s.imageUrl)

  const triggerImageGeneration = async () => {
    try {
      setIsGenerating(true)
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = await res.json()
      if (!payload.success) throw new Error(payload.error || "Image generation failed")
      setSlides(payload.slides)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <VoiceAlertBanner />

      {/* TABS */}
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid grid-cols-4 bg-black/20 border border-white/10 backdrop-blur-md rounded-lg p-1">
          <TabsTrigger value="linkedin" className="text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
          </TabsTrigger>
          <TabsTrigger value="carousel" className="text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Instagram className="h-4 w-4 mr-2" /> Carousel
          </TabsTrigger>
          <TabsTrigger value="threads" className="text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <MessageCircle className="h-4 w-4 mr-2" /> Threads
          </TabsTrigger>
          <TabsTrigger value="video" className="text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Video className="h-4 w-4 mr-2" /> Video
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------- */}
        {/* LINKEDIN SECTION */}
        {/* -------------------------------- */}
        <TabsContent value="linkedin">
          <Card className="bg-black/20 border border-white/10 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Linkedin className="text-white/60 h-5 w-5" />
                  <CardTitle className="text-white">LinkedIn Post</CardTitle>
                </div>
                <CopyButton text={data.linkedin} />
              </div>
              <CardDescription className="text-white/40">
                Long-form professional post optimized for LinkedIn reach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.linkedin}
                readOnly
                className="min-h-[200px] bg-black/30 border-white/10 text-white resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------- */}
        {/* CAROUSEL SECTION */}
        {/* -------------------------------- */}
        <TabsContent value="carousel" className="space-y-4">
          <Card className="bg-black/20 border border-white/10 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="text-white/60 h-5 w-5" />
                  <CardTitle className="text-white">Instagram Carousel</CardTitle>
                  <Badge className="bg-white/10 text-white/60 border-white/20">{slides.length} slides</Badge>
                </div>
              </div>
              <CardDescription className="text-white/40">
                Scroll-ready storytelling for Instagram carousels.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {anyMissingImages && (
                <div className="flex justify-end">
                  <Button
                    onClick={triggerImageGeneration}
                    disabled={isGenerating}
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  >
                    {isGenerating ? "Generating…" : "Generate Missing Images"}
                  </Button>
                </div>
              )}

              {/* SLIDES */}
              {slides.map((slide, i) => {
                const img = getSlideImage(slide)
                const prompt = getSlideImagePrompt(slide)

                return (
                  <div key={i} className="p-4 border border-white/10 bg-black/20 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </div>
                        <span className="text-white font-medium">Slide {i + 1}</span>
                      </div>
                      <CopyButton text={readableSlide(slide)} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* TEXT */}
                      <Textarea
                        value={readableSlide(slide)}
                        readOnly
                        className="bg-black/30 border-white/10 text-white resize-none min-h-[120px]"
                      />

                      {/* IMAGE */}
                      {img ? (
                        <div className="relative h-[200px] rounded-lg overflow-hidden border border-white/10 bg-black/10">
                          <Image
                            src={img}
                            alt={`Slide ${i + 1}`}
                            fill
                            className="object-cover transition-transform hover:scale-105 duration-500"
                          />
                        </div>
                      ) : prompt ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-white/50 border border-white/10 bg-black/10 rounded-lg p-4 text-center space-y-2">
                          <ImageIcon className="h-6 w-6 opacity-60" />
                          <p className="text-sm italic line-clamp-2">{prompt}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-white/40 border border-white/10 bg-black/10 rounded-lg p-4">
                          <ImageIcon className="h-6 w-6 opacity-40" />
                          <p className="text-sm mt-2">No image</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------- */}
        {/* THREADS */}
        {/* -------------------------------- */}
        <TabsContent value="threads">
          <Card className="bg-black/20 border border-white/10 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-white/60" />
                  <CardTitle className="text-white">Threads Post</CardTitle>
                  <Badge className="bg-white/10 text-white/60 border-white/20">
                    {data.threads.length} chars
                  </Badge>
                </div>
                <CopyButton text={data.threads} />
              </div>
              <CardDescription className="text-white/40">
                Conversational short-form content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.threads}
                readOnly
                className="min-h-[150px] bg-black/30 border-white/10 text-white resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------- */}
        {/* VIDEO SCRIPT */}
        {/* -------------------------------- */}
        <TabsContent value="video">
          <Card className="bg-black/20 border border-white/10 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-white/60" />
                  <CardTitle className="text-white">Video Script</CardTitle>
                  <Badge className="bg-white/10 text-white/60 border-white/20">Ready</Badge>
                </div>
                <CopyButton text={data.video_script} />
              </div>
              <CardDescription className="text-white/40">
                Short-form script for Reels / TikTok
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Textarea
                value={data.video_script}
                readOnly
                className="min-h-[240px] bg-black/30 border-white/10 text-white font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
