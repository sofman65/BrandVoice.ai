"use client"

import { useState, useEffect } from "react"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Plus, 
  Video, 
  Instagram, 
  Youtube, 
  Calendar,
  Clock,
  Bookmark,
  Share2,
  MoreHorizontal,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ContentItem {
  id: string
  title: string
  description: string
  link: string
  platform: "youtube" | "instagram" | "tiktok"
  savedAt: string
  thumbnail?: string
  duration?: string
  views?: string
  tags: string[]
}

export default function LibraryPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: "1",
        title: "10 Marketing Strategies That Actually Work",
        description: "A comprehensive guide to modern marketing strategies that drive real results for businesses of all sizes.",
        link: "https://youtube.com/watch?v=example1",
        platform: "youtube",
        savedAt: "2024-01-15T10:30:00Z",
        duration: "12:34",
        views: "1.2M",
        tags: ["marketing", "strategy", "business"]
      },
      {
        id: "2",
        title: "Instagram Reels Best Practices",
        description: "Learn how to create engaging Instagram Reels that boost your brand's visibility and engagement.",
        link: "https://instagram.com/p/example2",
        platform: "instagram",
        savedAt: "2024-01-14T15:45:00Z",
        views: "45K",
        tags: ["instagram", "reels", "social-media"]
      },
      {
        id: "3",
        title: "TikTok Content Creation Tips",
        description: "Master the art of creating viral TikTok content with these proven techniques and strategies.",
        link: "https://tiktok.com/@example3",
        platform: "tiktok",
        savedAt: "2024-01-13T09:20:00Z",
        duration: "2:15",
        views: "890K",
        tags: ["tiktok", "viral", "content-creation"]
      },
      {
        id: "4",
        title: "YouTube SEO Optimization",
        description: "Complete guide to optimizing your YouTube videos for better search rankings and discoverability.",
        link: "https://youtube.com/watch?v=example4",
        platform: "youtube",
        savedAt: "2024-01-12T14:15:00Z",
        duration: "18:45",
        views: "567K",
        tags: ["youtube", "seo", "optimization"]
      },
      {
        id: "5",
        title: "Instagram Story Engagement",
        description: "How to create Instagram Stories that keep your audience engaged and coming back for more.",
        link: "https://instagram.com/p/example5",
        platform: "instagram",
        savedAt: "2024-01-11T11:30:00Z",
        views: "23K",
        tags: ["instagram", "stories", "engagement"]
      },
      {
        id: "6",
        title: "TikTok Algorithm Secrets",
        description: "Understanding the TikTok algorithm and how to make your content work with it, not against it.",
        link: "https://tiktok.com/@example6",
        platform: "tiktok",
        savedAt: "2024-01-10T16:20:00Z",
        duration: "5:30",
        views: "1.5M",
        tags: ["tiktok", "algorithm", "viral"]
      }
    ]

    setContentItems(mockContent)
    setFilteredItems(mockContent)
    setIsLoading(false)
  }, [])

  // Filter content based on search and platform
  useEffect(() => {
    let filtered = contentItems

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by platform
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(item => item.platform === selectedPlatform)
    }

    setFilteredItems(filtered)
  }, [contentItems, searchQuery, selectedPlatform])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />
      case "tiktok":
        return <Video className="h-4 w-4 text-black" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleSaveContent = () => {
    toast.success("Content saved to your library!")
  }

  const handleShareContent = (item: ContentItem) => {
    navigator.clipboard.writeText(item.link)
    toast.success("Link copied to clipboard!")
  }

  const handleUseAsReference = (item: ContentItem) => {
    // Store the reference content in localStorage for the repurpose page
    localStorage.setItem('referenceContent', JSON.stringify(item))
    toast.success("Content set as reference! Navigate to Repurpose to use it.")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your library...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Content Library</h1>
              <p className="text-gray-300 text-lg">
                Your saved social media content for inspiration and repurposing
              </p>
            </div>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="h-4 w-4 mr-2" />
                New Repurpose
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedPlatform === "all" ? "default" : "outline"}
                  onClick={() => setSelectedPlatform("all")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  All
                </Button>
                <Button
                  variant={selectedPlatform === "youtube" ? "default" : "outline"}
                  onClick={() => setSelectedPlatform("youtube")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </Button>
                <Button
                  variant={selectedPlatform === "instagram" ? "default" : "outline"}
                  onClick={() => setSelectedPlatform("instagram")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  variant={selectedPlatform === "tiktok" ? "default" : "outline"}
                  onClick={() => setSelectedPlatform("tiktok")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Video className="h-4 w-4 mr-2" />
                  TikTok
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </h2>
            <Button
              onClick={handleSaveContent}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save New Content
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
                <p className="text-gray-300 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Start saving content to build your library"}
                </p>
                <Button
                  onClick={handleSaveContent}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save Your First Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(item.platform)}
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {item.platform}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUseAsReference(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareContent(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardTitle className="text-white mb-2 line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mb-4 line-clamp-3">
                      {item.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-4">
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </span>
                        )}
                        {item.views && (
                          <span>{item.views} views</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.savedAt)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
