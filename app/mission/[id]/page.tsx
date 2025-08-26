"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Copy, Check, Zap, Globe, Video, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { ContentResults } from "@/components/content-results"
import type { GeneratedContent } from "@/lib/types"

interface Mission {
  id: string
  title: string
  platform: "instagram" | "youtube"
  sourceUrl: string
  pinned: boolean
  createdAt: string
  outputs: GeneratedContent
}

export default function MissionDetailPage() {
  const params = useParams()
  const [mission, setMission] = useState<Mission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMission = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const res = await fetch(`/api/missions/${params.id}`, {
          credentials: "include"
        })

        if (!res.ok) {
          if (res.status === 404) {
            setError("Mission not found")
          } else {
            setError("Failed to load mission")
          }
          return
        }

        const data = await res.json()
        console.log("🔍 Mission data received:", data.data)
        console.log("🔍 Mission outputs:", data.data?.outputs)
        setMission(data.data)
      } catch (err) {
        console.error("Error fetching mission:", err)
        setError("Failed to load mission")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMission()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-gray-400">Loading mission...</p>
        </div>
      </div>
    )
  }

  if (error || !mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || "Mission not found"}</p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Missions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-300 hover:text-purple-200 text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mission Log
          </Link>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Mission Header */}
          <div className="bg-white/10 backdrop-blur-xl border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{mission.title}</h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                    {mission.platform === "instagram" ? "Instagram" : "YouTube"}
                  </span>
                  <span className="text-sm">
                    Created {new Date(mission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {mission.pinned && (
                <div className="text-yellow-400">
                  <Sparkles className="h-6 w-6" />
                </div>
              )}
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Source URL</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={mission.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 break-all"
                >
                  {mission.sourceUrl}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(mission.sourceUrl)
                    toast.success("URL copied to clipboard")
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Generated Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Generated Content</h2>
            </div>
            {mission.outputs && Object.keys(mission.outputs).length > 0 ? (
              <ContentResults data={mission.outputs} />
            ) : (
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-gray-400 mb-4">No generated content available for this mission.</p>
                <p className="text-sm text-gray-500">
                  This mission may not have been completed or the content generation failed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
