import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrandVoice.ai - Instagram Content Repurposer | Spaceslam",
  description:
    "Transform your Instagram posts into multi-platform content with AI. Generate LinkedIn posts, Instagram carousels, Threads posts, and video scripts instantly.",
  keywords: [
    "Instagram content repurposer",
    "AI content generation",
    "social media automation",
    "multi-platform content",
    "BrandVoice.ai",
    "Spaceslam",
    "content marketing",
    "social media tools",
  ],
  authors: [{ name: "Spaceslam", url: "https://space-slam.com" }],
  creator: "Spaceslam",
  publisher: "Spaceslam",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandvoice.ai",
    title: "BrandVoice.ai - Instagram Content Repurposer",
    description:
      "Transform your Instagram posts into multi-platform content with AI-powered technology from Spaceslam.",
    siteName: "BrandVoice.ai",
    images: [
      {
        url: "/spaceslam-logo.svg",
        width: 1200,
        height: 630,
        alt: "BrandVoice.ai by Spaceslam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandVoice.ai - Instagram Content Repurposer",
    description: "Transform your Instagram posts into multi-platform content with AI.",
    images: ["/spaceslam-logo.svg"],
    creator: "@spaceslam",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
