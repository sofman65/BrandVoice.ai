"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Youtube, Instagram, Video, Calendar, Share2, Bookmark, Sparkles, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatRelativeDate, getPlatformIconConfig, cn, isValidYouTubeUrl } from "@/lib/utils";

type ContentItem = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
};

// Helper to detect platform from URL
function detectPlatform(url: string): "youtube" | "instagram" | "tiktok" | "web" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  return "web";
}

export default function LibraryPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Add content dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch content from API
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/contentBank", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setContentItems(data.data || []);
      } else {
        console.error("Failed to fetch content bank");
        toast.error("Failed to load content library");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content library");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Filtering
  useEffect(() => {
    let filtered = contentItems;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        [item.title, ...(item.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => detectPlatform(item.url) === selectedPlatform);
    }

    setFilteredItems(filtered);
  }, [contentItems, searchQuery, selectedPlatform]);

  const handleShare = (item: ContentItem) => {
    navigator.clipboard.writeText(item.url);
    toast.success("Link copied");
  };

  const handleUseAsReference = (item: ContentItem) => {
    const referenceData = {
      id: item.id,
      title: item.title,
      description: "",
      link: item.url,
      platform: detectPlatform(item.url),
      savedAt: item.createdAt,
      thumbnail: item.thumbnail,
      tags: item.tags || [],
    };
    localStorage.setItem("referenceContent", JSON.stringify(referenceData));
    toast.success("Set as reference for Repurpose");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch("/api/contentBank", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setContentItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Content deleted");
      } else {
        toast.error("Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Try to fetch thumbnail for YouTube URLs
      let thumbnail = null;
      if (isValidYouTubeUrl(newUrl)) {
        // Extract video ID and use YouTube thumbnail
        const match = newUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/);
        if (match?.[1]) {
          thumbnail = `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
        }
      }

      const response = await fetch("/api/contentBank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
          tags: newTags ? newTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          thumbnail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContentItems((prev) => [data.data, ...prev]);
        setNewTitle("");
        setNewUrl("");
        setNewTags("");
        setIsAddDialogOpen(false);
        toast.success("Content added to library");
      } else {
        toast.error("Failed to add content");
      }
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("Failed to add content");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-white/70">Loading your library...</p>
        </div>
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
                {["all", "youtube"].map((platform) => (
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 text-white border border-white/10 hover:bg-white/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Add to Content Library</DialogTitle>
                <DialogDescription className="text-white/60">
                  Save a URL to use as reference when repurposing content.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddContent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter a title..."
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">URL</Label>
                  <Input
                    id="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="marketing, tips, tutorial"
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add to Library"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <Card className="bg-black/20 border-white/10 backdrop-blur-md p-10 text-center">
            <Bookmark className="h-10 w-10 text-white/40 mx-auto mb-4" />
            <p className="text-gray-300 mb-1">No content found</p>
            <p className="text-white/40 mb-4">
              {contentItems.length === 0
                ? "Add your first piece of content to get started"
                : "Try adjusting your search"}
            </p>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-white/10 border-white/10 hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Content
            </Button>
          </Card>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const platform = detectPlatform(item.url);
              return (
                <Card
                  key={item.id}
                  className="group bg-black/20 border-white/10 backdrop-blur-md hover:bg-white/5 transition"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon(platform)}
                        <Badge className="bg-white/10 border-white/10 text-white/70">
                          {platform}
                        </Badge>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => handleUseAsReference(item)}
                          title="Use as reference"
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => handleShare(item)}
                          title="Copy link"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-400/70 hover:text-red-400 hover:bg-white/10"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardTitle className="text-white line-clamp-2 mb-2">{item.title}</CardTitle>
                    
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 text-sm line-clamp-1 mb-3 block"
                    >
                      {item.url}
                    </a>

                    <div className="flex justify-between items-center text-white/40 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-white/10 border-white/10 text-white/60 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge className="bg-white/10 border-white/10 text-white/60 text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
