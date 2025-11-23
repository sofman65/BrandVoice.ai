"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Sparkles, Rocket, Check, Bookmark, X, Zap
} from "lucide-react";
import { VoicePicker } from "@/features/voices/components/voice-picker";
import { ContentSelectorModal } from "@/components/content-selector-modal";
import {
  validateUrl,
  fetchPreviewData,
  findExistingMission,
  type SourceType,
} from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { InstagramPreview } from "@/components/instagram-preview";
import { YouTubePreview } from "@/components/youtube-preview";
import { ContentResults } from "@/features/missions/components/content-results";
import { LOADING_STATES } from "@/lib/constants";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

interface ReferenceContent {
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

interface ProcessResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function RepurposePage() {
  const searchParams = useSearchParams();

  // --------------------
  // State
  // --------------------
  const [url, setUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [missionData, setMissionData] = useState<any>(null);
  const [existingMissionId, setExistingMissionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [referenceContent, setReferenceContent] =
    useLocalStorage<ReferenceContent | null>("referenceContent", null);

  const urlValidation = useMemo(() => validateUrl(url), [url]);

  // --------------------
  // Mutation
  // --------------------
  const mutation = useMutation({
    mutationFn: async (contentUrl: string) => {
      const requestBody: any = { url: contentUrl };

      if (referenceContent) requestBody.referenceContent = referenceContent;

      const currentMissionId = localStorage.getItem("currentMissionId");
      if (currentMissionId) requestBody.missionId = currentMissionId;

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: ProcessResponse = await response.json();

      if (!data.success || !data.data) throw new Error(data.error || "Processing failed");

      return data.data;
    },

    onSuccess: () => {
      localStorage.removeItem("currentMissionId");
      window.dispatchEvent(new CustomEvent("missionCompleted"));
      toast.success("Content generated successfully!");
    },

    onError: (err: any) => {
      toast.error(err.message || "Processing failed");
    },
  });

  // --------------------
  // Handle URL Changes
  // --------------------
  const handleUrlChange = async (value: string) => {
    setUrl(value);
    const { isValid, type } = validateUrl(value);

    if (!value || !isValid || !type) {
      setPreviewData(null);
      setSourceType(null);
      setShowPreview(false);
      setMissionData(null);
      setExistingMissionId(null);
      return;
    }

    setSourceType(type);
    setShowPreview(true);
    setPreviewData(null);

    try {
      const [preview, existing] = await Promise.all([
        fetchPreviewData(value),
        findExistingMission(value),
      ]);

      setPreviewData(preview);

      if (existing?.outputs) {
        setMissionData(existing.outputs);
        setExistingMissionId(existing.id);
      } else {
        setMissionData(null);
        setExistingMissionId(null);
      }
    } catch {
      setPreviewData(null);
    }
  };

  // --------------------
  // Submit
  // --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) return toast.error("Enter a URL");
    if (!urlValidation.isValid) return toast.error("Invalid YouTube or Instagram link");

    mutation.mutate(url);
  };

  const handleReset = () => {
    setUrl("");
    setShowPreview(false);
    setPreviewData(null);
    setMissionData(null);
    setReferenceContent(null);
    mutation.reset();
  };

  const clearReference = () => {
    setReferenceContent(null);
    toast("Reference cleared");
  };

  // --------------------
  // UI
  // --------------------
  const isDisabled = mutation.isPending || !previewData || !!missionData;
  const results = missionData || mutation.data;

  return (
    <div className="relative px-4 py-8 md:px-6 lg:px-8">

      {/* Loading animation */}
      <MultiStepLoader
        loadingStates={LOADING_STATES}
        loading={mutation.isPending}
        duration={1100}
      />

      <div className="mx-auto w-full max-w-5xl space-y-12">

        {/* --------------------
           HERO
        --------------------- */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70">
            <Sparkles className="h-4 w-4 text-white/60" />
            BrandVoice Repurposing Engine
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Repurpose Your Social Content
          </h1>

          <p className="max-w-xl mx-auto text-white/60">
            Paste a YouTube or Instagram link and get platform-ready posts in your voice.
          </p>
        </section>

        {/* --------------------
           VOICE PICKER
        --------------------- */}
        <div className="flex justify-end">
          <VoicePicker value={selectedVoice} onChange={setSelectedVoice} />
        </div>

        {/* --------------------
           REFERENCE CONTENT
        --------------------- */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Reference Content (Optional)
              </CardTitle>

              {referenceContent && (
                <Button variant="ghost" size="sm" onClick={clearReference} className="text-white/50 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription className="text-white/60">
              Select something from your library to influence tone, ideas, or structure.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!referenceContent ? (
              <div className="py-6 text-center">
                <p className="text-white/50 mb-4">No reference selected</p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Browse Library
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-black/30 border border-white/10 p-4">
                <h4 className="font-semibold text-white mb-1">{referenceContent.title}</h4>
                <p className="text-white/60 text-sm line-clamp-2">
                  {referenceContent.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* --------------------
           INPUT CARD
        --------------------- */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-xl">Mission Control</CardTitle>
            <CardDescription className="text-white/60">
              Paste a link to begin the repurposing process.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            <form onSubmit={handleSubmit} className="space-y-3">
              <Label htmlFor="mission-url" className="text-white">URL</Label>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="mission-url"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={mutation.isPending}
                  className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/40"
                />

                <Button
                  type="submit"
                  disabled={isDisabled}
                  className="h-12 sm:w-auto w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing…
                    </>
                  ) : missionData ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Already processed
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Repurpose
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* --------------------
                PREVIEW
            --------------------- */}
            {showPreview && (
              <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-white">
                    {sourceType === "instagram" ? "Instagram Preview" : "YouTube Preview"}
                  </h4>
                </div>

                {sourceType === "instagram" ? (
                  <InstagramPreview url={url} data={previewData} isLoading={!previewData} />
                ) : (
                  <YouTubePreview url={url} data={previewData} isLoading={!previewData} />
                )}
              </div>
            )}

            {/* --------------------
                RESULTS
            --------------------- */}
            {results && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl text-white font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    Mission Complete
                  </h3>

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-white/10 bg-black/20 text-white hover:bg-white/10"
                  >
                    New Mission
                  </Button>
                </div>

                <ContentResults data={results} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ContentSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(content) => setReferenceContent(content)}
      />
    </div>
  );
}
