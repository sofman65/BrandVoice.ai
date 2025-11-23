"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Youtube, Instagram, Video, Calendar, Clock, Share2, Bookmark, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeDate, getPlatformIconConfig, cn } from "@/lib/utils";

type ContentItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  platform: "youtube" | "instagram" | "tiktok";
  savedAt: string;
  thumbnail?: string;
  duration?: string;
  views?: string;
  tags: string[];
};

export default function LibraryPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock content
  useEffect(() => {
    const mockContent: ContentItem[] = [
      {
        id: "1",
        title: "10 Marketing Strategies That Actually Work",
        description: "A comprehensive guide to modern marketing strategies.",
        link: "https://youtube.com/watch?v=example1",
        platform: "youtube",
        savedAt: "2024-01-15T10:30:00Z",
        duration: "12:34",
        views: "1.2M",
        tags: ["marketing", "strategy", "business"],
      },
      {
        id: "2",
        title: "Instagram Reels Best Practices",
        description: "Learn how to create engaging Instagram Reels.",
        link: "https://instagram.com/p/example2",
        platform: "instagram",
        savedAt: "2024-01-14T15:45:00Z",
        views: "45K",
        tags: ["instagram", "reels"],
      },
    ];

    setContentItems(mockContent);
    setFilteredItems(mockContent);
    setIsLoading(false);
  }, []);

  // Filtering
  useEffect(() => {
    let filtered = contentItems;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        [item.title, item.description, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => item.platform === selectedPlatform);
    }

    setFilteredItems(filtered);
  }, [contentItems, searchQuery, selectedPlatform]);

  const handleShare = (item: ContentItem) => {
    navigator.clipboard.writeText(item.link);
    toast.success("Link copied");
  };

  const handleUseAsReference = (item: ContentItem) => {
    localStorage.setItem("referenceContent", JSON.stringify(item));
    toast.success("Set as reference for Repurpose");
  };

  const getIcon = (platform: string) => {
    const config = getPlatformIconConfig(platform);
    switch (config.name) {
      case "youtube":
        return <Youtube className={config.className} />;
      case "instagram":
        return <Instagram className={config.className} />;
      default:
        return <Video className={config.className} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading your library...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">

        {/* Header */}
        <header className="space-y-3">
          <h1 className="text-4xl font-bold text-white">Content Library</h1>
          <p className="text-gray-300">Your curated source material for repurposing.</p>
        </header>

        {/* Search + Filters */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardContent className="p-6 space-y-4">

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Platform filters */}
              <div className="flex gap-2">
                {["all", "youtube", "instagram", "tiktok"].map((platform) => (
                  <Button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      "border-white/10 bg-black/20 text-white hover:bg-white/10",
                      selectedPlatform === platform && "bg-white/10"
                    )}
                  >
                    {platform === "all" ? "All" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count + Add */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </h2>

          <Button className="bg-white/10 text-white border border-white/10 hover:bg-white/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <Card className="bg-black/20 border-white/10 backdrop-blur-md p-10 text-center">
            <Bookmark className="h-10 w-10 text-white/40 mx-auto mb-4" />
            <p className="text-gray-300 mb-1">No content found</p>
            <p className="text-white/40 mb-4">Try adjusting your search</p>

            <Button className="bg-white/10 border-white/10 hover:bg-white/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Content
            </Button>
          </Card>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-black/20 border-white/10 backdrop-blur-md hover:bg-white/10 transition"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(item.platform)}
                      <Badge className="bg-white/10 border-white/10 text-white/70">
                        {item.platform}
                      </Badge>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/70 hover:text-white"
                        onClick={() => handleUseAsReference(item)}
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/70 hover:text-white"
                        onClick={() => handleShare(item)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardTitle className="text-white line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="text-white/60 line-clamp-3 mb-3">
                    {item.description}
                  </CardDescription>

                  <div className="flex justify-between items-center text-white/40 text-sm mb-3">
                    <div className="flex items-center gap-4">
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.duration}
                        </span>
                      )}
                      {item.views && <span>{item.views} views</span>}
                    </div>

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeDate(item.savedAt)}
                    </span>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-white/10 border-white/10 text-white/60 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
