"use client"

import { useEffect } from "react"

interface KeyboardShortcuts {
  onSave?: () => void
  onNew?: () => void
  onLoad?: () => void
}

export function useKeyboardShortcuts({ onSave, onNew, onLoad }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        onSave?.()
      }

      // Ctrl/Cmd + N: New Project
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        onNew?.()
      }

      // Ctrl/Cmd + O: Load Project
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault()
        onLoad?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSave, onNew, onLoad])
}
