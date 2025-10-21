"use client"

import type * as React from "react"
import { useTheme } from "@/hooks/use-theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isMounted } = useTheme()

  if (!isMounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
