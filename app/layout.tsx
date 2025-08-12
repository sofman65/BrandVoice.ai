import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrandVoice.ai - Content Repurposer ",
  description:
    "Transform posts into multi-platform content with AI. Generate LinkedIn posts, Instagram carousels, Threads posts, and video scripts instantly.",
  keywords: [
    "Instagram content repurposer",
    "AI content generation",
    "social media automation",
    "multi-platform content",
    "BrandVoice.ai",
    "Sofianos Lampropoulos",
    "content marketing",
    "social media tools",
  ],
  authors: [{ name: "Sofianos Lampropoulos", url: "https://sofianos-lampropoulos.com" }],
  creator: "Sofianos Lampropoulos",
  publisher: "Sofianos Lampropoulos",
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
        url: "/sl-logo.svg",
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
    images: ["/sl-logo.svg"],
    creator: "@spaceslam",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: { formButtonPrimary: "bg-purple-600 hover:bg-purple-700" },
      }}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
    >
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
    </ClerkProvider>
  )
}
