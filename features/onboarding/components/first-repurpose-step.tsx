"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ContentResults } from "@/features/missions/components/content-results";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

import { LOADING_STATES } from "@/lib/constants";
import { isValidYouTubeUrl, isValidInstagramUrl } from "@/lib/utils";

import { Rocket, Upload, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedContent } from "@/lib/types";

interface FirstRepurposeStepProps {
  onComplete: (data: any) => void;
  platform?: string | null;
  voiceProfileId?: string | null;
}

export function FirstRepurposeStep({
  onComplete,
  platform,
  voiceProfileId,
}: FirstRepurposeStepProps) {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const [showVoiceAlert, setShowVoiceAlert] = useState(!voiceProfileId);

  /** -------- Validation -------- */
  const validateInput = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return false;
    }
    if (platform === "youtube" && !isValidYouTubeUrl(url)) {
      toast.error("Invalid YouTube URL");
      return false;
    }
    if (platform === "instagram" && !isValidInstagramUrl(url)) {
      toast.error("Invalid Instagram URL");
      return false;
    }
    return true;
  };

  /** -------- Generate Content -------- */
  const handleGenerate = async () => {
    if (!validateInput()) return;

    setIsGenerating(true);

    try {
      // Create mission
      const missionResponse = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: `First Mission: ${url.slice(0, 50)}...`,
          platform,
          sourceUrl: url,
          description: "Your first repurposed content!",
        }),
      });

      if (!missionResponse.ok) throw new Error("Failed to create mission");

      const missionData = await missionResponse.json();
      const missionId = missionData.data.id;
      localStorage.setItem("currentMissionId", missionId);

      // Process content
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          missionId,
          url,
          voiceProfileId,
        }),
      });

      if (!processResponse.ok) throw new Error("Failed to process content");

      const processData = await processResponse.json();
      if (!processData.success) throw new Error(processData.error);

      setGeneratedContent(processData.data);
      toast.success("Your content is ready! 🎉");

      localStorage.removeItem("currentMissionId");
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    onComplete({
      generatedContent,
      firstMissionCompleted: true,
    });
  };

  /** -------- Placeholder Texts -------- */
  const getInputLabel = () => {
    switch (platform) {
      case "youtube":
        return "YouTube URL";
      case "instagram":
        return "Instagram URL";
      default:
        return "Content URL";
    }
  };

  const getInputPlaceholder = () => {
    switch (platform) {
      case "youtube":
        return "https://youtube.com/watch?v=...";
      case "instagram":
        return "https://instagram.com/p/...";
      default:
        return "Paste your video link here";
    }
  };

  return (
    <div className="space-y-10">
      <MultiStepLoader loadingStates={LOADING_STATES} loading={isGenerating} duration={1200} />

      {/* Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          Transform your first content
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Paste a link and BrandVoice will turn it into multi-platform magic.
        </p>
      </div>

      {/* Voice Warning */}
      {showVoiceAlert && (
        <Alert className="mx-auto max-w-2xl bg-amber-500/10 border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            This will be generated using our default AI voice.{" "}
            <button
              className="underline-offset-2 hover:underline"
              onClick={() => setShowVoiceAlert(false)}
            >
              Continue anyway
            </button>
          </AlertDescription>
        </Alert>
      )}

      {!generatedContent && (
        <Card className="max-w-2xl mx-auto bg-white/5 border-white/10 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">{getInputLabel()}</CardTitle>
            <CardDescription className="text-white/60">
              We’ll fetch the content and generate every format for you.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">{getInputLabel()}</Label>
              <Input
                type="url"
                placeholder={getInputPlaceholder()}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isGenerating}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400"
              />
            </div>

            <Button
              size="lg"
              disabled={isGenerating || !url.trim()}
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Generate My First Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {generatedContent && (
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-semibold text-white flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-300" />
              Your Content is Ready!
            </h3>
            <p className="text-white/60">Here’s everything BrandVoice created for you.</p>
          </div>

          <ContentResults data={generatedContent} />

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-10 py-3 text-lg text-white font-semibold"
            >
              Complete Onboarding
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!generatedContent && (
        <div className="max-w-2xl mx-auto">
          <Card className="bg-purple-500/10 border-purple-500/20 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-300" />
                Pro Tips for Best Results
              </h4>
              <ul className="text-white/60 space-y-2 text-sm">
                <li>• Clear audio = better repurposing</li>
                <li>• Longer content gives us more context</li>
                <li>• Educational content works incredibly well</li>
                <li>• Make sure it matches your brand voice</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
