import type React from "react"

export default function AutomationLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return <section>{children}</section>
}


