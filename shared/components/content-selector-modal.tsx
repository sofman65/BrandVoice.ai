"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Video,
  Instagram,
  Youtube,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

/* ---------------------------------- Types ---------------------------------- */

interface ContentItem {
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
}

interface ContentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: ContentItem) => void;
}

/* ------------------------------- Final Component ------------------------------- */

export function ContentSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: ContentSelectorModalProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  /* Mock content — replace with API */
  useEffect(() => {
    const mock: ContentItem[] = [
      {
        id: "1",
        title: "10 Marketing Strategies That Actually Work",
        description: "A guide to modern marketing strategies.",
        link: "#",
        platform: "youtube",
        savedAt: "2024-01-15T10:30:00Z",
        duration: "12:34",
        views: "1.2M",
        tags: ["marketing", "strategy", "business"],
      },
      {
        id: "2",
        title: "Instagram Reels Best Practices",
        description: "How to create engaging IG reels.",
        link: "#",
        platform: "instagram",
        savedAt: "2024-01-14T15:45:00Z",
        views: "45K",
        tags: ["instagram", "reels"],
      },
      {
        id: "3",
        title: "TikTok Growth Tips",
        description: "Master virality on TikTok.",
        link: "#",
        platform: "tiktok",
        savedAt: "2024-01-12T10:00:00Z",
        duration: "2:15",
        views: "890K",
        tags: ["tiktok", "growth"],
      },
    ];

    setContentItems(mock);
    setFilteredItems(mock);
    setIsLoading(false);
  }, []);

  /* Filtering logic */
  useEffect(() => {
    let filtered = contentItems;

    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => item.platform === selectedPlatform);
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedPlatform, contentItems]);

  const dateLabel = (date: string) => new Date(date).toLocaleDateString();

  const iconFor = (p: string) => {
    switch (p) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case "tiktok":
        return <Video className="h-4 w-4 text-white" />;
      default:
        return null;
    }
  };

  const handleSelect = (item: ContentItem) => {
    onSelect(item);
    onClose();
    toast.success("Reference content selected.");
  };

  /* -------------------------------------------------------------------------- */
  /*                                 RENDER UI                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={clsx(
          "max-w-3xl w-full p-0 overflow-hidden",
          "rounded-xl border border-white/10",
          "bg-black/50 backdrop-blur-2xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-90 duration-200"
        )}
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white">
              Select Reference Content
            </DialogTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            Choose content from your library to influence tone & structure.
          </p>
        </DialogHeader>

        {/* Search bar */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search your content…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-purple-400"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="max-h-[55vh] overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-gray-400 py-10">
              Loading content…
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No matching content.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={clsx(
                  "w-full text-left p-4 rounded-lg",
                  "bg-white/5 hover:bg-white/10",
                  "border border-white/10 hover:border-purple-400/30",
                  "transition-colors duration-150"
                )}
              >
                <div className="flex items-start gap-4">
                  {iconFor(item.platform)}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white">
                        {item.title}
                      </h4>

                      <Badge className="bg-white/10 border-white/10 text-gray-200 capitalize text-[11px]">
                        {item.platform}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-3">
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </span>
                        )}
                        {item.views && <span>{item.views} views</span>}
                      </div>

                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateLabel(item.savedAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 border-white/10 text-gray-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredItems.length} of {contentItems.length} items
          </span>

          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
