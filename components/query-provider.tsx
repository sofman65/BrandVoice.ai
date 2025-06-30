"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

/**
 * Wraps children with a pre-configured TanStack Query client.
 * We memoise the client in a `useState` callback so the same
 * instance is reused across re-renders (per Next.js recommendation).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Lazy-initialise for one stable instance
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
