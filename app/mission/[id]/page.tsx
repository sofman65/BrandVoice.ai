"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Copy, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Mission, MissionOutcome, GeneratedContent } from "@/lib/types";
import { transformOutcomesToGeneratedContent } from "@/lib/utils";
import { ContentResults } from "@/features/missions/components/content-results";

export default function MissionDetailPage() {
  const params = useParams();
  const [mission, setMission] = useState<Mission | null>(null);
  const [outcomes, setOutcomes] = useState<MissionOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Fetch mission + outcomes
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);

        const missionRes = await fetch(`/api/missions/${params.id}`, { credentials: "include" });
        if (!missionRes.ok) {
          setError(missionRes.status === 404 ? "Mission not found" : "Failed to load mission");
          return;
        }

        const missionJson = await missionRes.json();
        setMission(missionJson.data);

        const outcomesRes = await fetch(`/api/missions/${params.id}/outcomes`, { credentials: "include" });
        if (outcomesRes.ok) {
          const outcomesJson = await outcomesRes.json();
          setOutcomes(outcomesJson.data || []);
        } else {
          setOutcomes([]);
        }
      } catch {
        setError("Failed to load mission");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // ---------------------------
  // Loading state
  // ---------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto" />
          <p className="text-white/50">Loading mission…</p>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Error state
  // ---------------------------
  if (error || !mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || "Mission not found"}</p>

  
        </div>
      </div>
    );
  }

  const generatedContent = transformOutcomesToGeneratedContent(outcomes);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="relative px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Back link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mission Log
          </Link>
        </div>

        {/* ---------------------------
           Mission header card
        --------------------------- */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-3xl font-bold mb-2">
                  {mission.title}
                </CardTitle>

                <div className="flex gap-4 text-white/60 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">
                    {mission.platform === "instagram" ? "Instagram" : "YouTube"}
                  </span>

                  <span>
                    Created {new Date(mission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {mission.pinned && (
                <Sparkles className="h-6 w-6 text-yellow-300" />
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg bg-black/30 border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-2">Source URL</h3>

              <div className="flex items-center gap-2 break-all">
                <a
                  href={mission.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline-offset-2 hover:underline transition"
                >
                  {mission.sourceUrl}
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(mission.sourceUrl);
                    toast.success("URL copied to clipboard");
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------
           Generated content
        --------------------------- */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">Generated Content</h2>
          </div>

          {generatedContent ? (
            <ContentResults data={generatedContent} />
          ) : (
            <div className="rounded-lg bg-black/20 border border-white/10 backdrop-blur p-6 text-center">
              <p className="text-white/60 mb-2">
                No generated content for this mission yet.
              </p>
              <p className="text-white/40 text-sm">
                The mission may not be processed or the generation failed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
