import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "react-hot-toast"
import { QueryProvider } from "./query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spaceslam Content Repurposer",
  description: "Turn any Instagram post into cross-platform content in seconds",
  keywords: ["content repurposing", "social media", "Instagram", "LinkedIn", "marketing"],
  authors: [{ name: "Spaceslam" }],
  openGraph: {
    title: "Spaceslam Content Repurposer",
    description: "Turn any Instagram post into cross-platform content in seconds",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
