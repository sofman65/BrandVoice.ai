"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react"

export default function OnboardingComplete() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border-white/20 text-center">
          <CardHeader className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                Welcome to BrandVoice.ai!
              </CardTitle>
              <CardDescription className="text-xl text-gray-300">
                You're all set up and ready to transform your content
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What's Next?</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-300">✨ Start Repurposing</h4>
                  <p className="text-sm text-gray-400">
                    Paste any YouTube or Instagram URL to create multi-platform content
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-300">🎯 Refine Your Voice</h4>
                  <p className="text-sm text-gray-400">
                    Update your brand voice anytime from your profile settings
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-300">📚 Build Your Library</h4>
                  <p className="text-sm text-gray-400">
                    Save great content as reference for future repurposing
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-300">🚀 Track Your Missions</h4>
                  <p className="text-sm text-gray-400">
                    View all your repurposed content in the mission dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3"
              >
                Start Creating Content
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-gray-400">
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
