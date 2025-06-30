"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Instagram, MessageCircle, Video, Sparkles } from "lucide-react"
import type { GeneratedContent } from "@/lib/types"

interface ContentResultsProps {
  data: GeneratedContent
}

export function ContentResults({ data }: ContentResultsProps) {
  return (
    <Tabs defaultValue="linkedin" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
        <TabsTrigger
          value="linkedin"
          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-gray-300"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </TabsTrigger>
        <TabsTrigger
          value="carousel"
          className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300 text-gray-300"
        >
          <Instagram className="h-4 w-4 mr-2" />
          Carousel
        </TabsTrigger>
        <TabsTrigger
          value="threads"
          className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-300"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Threads
        </TabsTrigger>
        <TabsTrigger
          value="video"
          className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 text-gray-300"
        >
          <Video className="h-4 w-4 mr-2" />
          Video
        </TabsTrigger>
      </TabsList>

      <TabsContent value="linkedin" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">LinkedIn Post</CardTitle>
              </div>
              <CopyButton text={data.linkedin} />
            </div>
            <CardDescription className="text-gray-400">
              Professional networking content optimized for business audiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.linkedin}
              readOnly
              className="min-h-[200px] bg-white/5 border-white/10 text-white resize-none focus:ring-blue-400/20 focus:border-blue-400"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="carousel" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-400" />
                <CardTitle className="text-white">Instagram Carousel</CardTitle>
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                  {data.carousel.length} slides
                </Badge>
              </div>
            </div>
            <CardDescription className="text-gray-400">Multi-slide storytelling content for Instagram</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.carousel.map((slide, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">Slide {index + 1}</span>
                  </div>
                  <CopyButton text={slide} />
                </div>
                <Textarea
                  value={slide}
                  readOnly
                  className="bg-white/5 border-white/10 text-white resize-none focus:ring-pink-400/20 focus:border-pink-400"
                  rows={3}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="threads" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-white">Threads Post</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {data.threads.length} chars
                </Badge>
              </div>
              <CopyButton text={data.threads} />
            </div>
            <CardDescription className="text-gray-400">Conversational content for Threads platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.threads}
              readOnly
              className="min-h-[150px] bg-white/5 border-white/10 text-white resize-none focus:ring-purple-400/20 focus:border-purple-400"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="video" className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-400" />
                <CardTitle className="text-white">Video Script</CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ready to film
                </Badge>
              </div>
              <CopyButton text={data.video_script} />
            </div>
            <CardDescription className="text-gray-400">
              Complete script for Instagram Reels and TikTok videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.video_script}
              readOnly
              className="min-h-[250px] bg-white/5 border-white/10 text-white resize-none focus:ring-green-400/20 focus:border-green-400 font-mono text-sm"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
