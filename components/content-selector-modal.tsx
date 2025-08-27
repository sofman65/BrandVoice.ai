"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Video, 
  Instagram, 
  Youtube, 
  Calendar,
  Clock,
  X,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

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

interface ContentSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (content: ContentItem) => void
}

export function ContentSelectorModal({ isOpen, onClose, onSelect }: ContentSelectorModalProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration - in real app this would come from API
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
      },
      {
        id: "7",
        title: "LinkedIn Content Strategy",
        description: "Professional content strategies that build authority and drive business growth on LinkedIn.",
        link: "https://linkedin.com/posts/example7",
        platform: "youtube",
        savedAt: "2024-01-09T13:20:00Z",
        duration: "8:45",
        views: "234K",
        tags: ["linkedin", "professional", "strategy"]
      },
      {
        id: "8",
        title: "Twitter Thread Mastery",
        description: "How to create compelling Twitter threads that go viral and build your audience.",
        link: "https://twitter.com/example8",
        platform: "instagram",
        savedAt: "2024-01-08T10:15:00Z",
        views: "67K",
        tags: ["twitter", "threads", "viral"]
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

  const handleSelect = (item: ContentItem) => {
    onSelect(item)
    onClose()
    toast.success("Reference content selected!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-300" />
              <DialogTitle className="text-xl font-bold text-white">Select Reference Content</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-300 text-sm">
            Choose content from your library to use as inspiration for your new repurpose
          </p>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="space-y-4 pb-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your content library..."
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
              All ({contentItems.length})
            </Button>
            <Button
              variant={selectedPlatform === "youtube" ? "default" : "outline"}
              onClick={() => setSelectedPlatform("youtube")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Youtube className="h-4 w-4 mr-2" />
              YouTube ({contentItems.filter(item => item.platform === "youtube").length})
            </Button>
            <Button
              variant={selectedPlatform === "instagram" ? "default" : "outline"}
              onClick={() => setSelectedPlatform("instagram")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Instagram ({contentItems.filter(item => item.platform === "instagram").length})
            </Button>
            <Button
              variant={selectedPlatform === "tiktok" ? "default" : "outline"}
              onClick={() => setSelectedPlatform("tiktok")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Video className="h-4 w-4 mr-2" />
              TikTok ({contentItems.filter(item => item.platform === "tiktok").length})
            </Button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white">Loading your content library...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No content found</div>
              <div className="text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Start saving content to build your library"}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-4 rounded-lg border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                          {item.title}
                        </h4>
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                          {item.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
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
                        {item.tags.slice(0, 4).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-gray-300">
                            +{item.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{filteredItems.length} of {contentItems.length} items</span>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
