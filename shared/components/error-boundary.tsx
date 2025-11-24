"use client"
import * as React from "react"

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  override componentDidCatch(error: unknown) {
    console.error("MissionDetail crashed:", error)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/80">
            Something went wrong. Please reload the page.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


