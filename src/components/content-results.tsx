"use client"

import type { GeneratedContent } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/copy-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContentResultsProps {
  content: GeneratedContent
}

export function ContentResults({ content }: ContentResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="video">Video Script</TabsTrigger>
        </TabsList>

        <TabsContent value="linkedin" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>LinkedIn Post</CardTitle>
              <CopyButton text={content.linkedin} />
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.linkedin}
                readOnly
                className="min-h-[200px] resize-none"
                aria-label="LinkedIn post content"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Carousel Slides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.carousel.map((slide, index) => (
                <div key={index} className="border rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Slide {index + 1}</h4>
                    <CopyButton text={slide} />
                  </div>
                  <Textarea
                    value={slide}
                    readOnly
                    className="min-h-[100px] resize-none"
                    aria-label={`Carousel slide ${index + 1} content`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threads" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Threads Post</CardTitle>
              <CopyButton text={content.threads} />
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.threads}
                readOnly
                className="min-h-[150px] resize-none"
                aria-label="Threads post content"
              />
              <p className="text-sm text-muted-foreground mt-2">{content.threads.length}/500 characters</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Script</CardTitle>
              <CopyButton text={content.video_script} />
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.video_script}
                readOnly
                className="min-h-[250px] resize-none font-mono"
                aria-label="Video script content"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
