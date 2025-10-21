"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layout, Eye, Code } from "lucide-react"

interface SplitViewToggleProps {
  onViewChange: (view: "split" | "editor" | "preview") => void
}

export function SplitViewToggle({ onViewChange }: SplitViewToggleProps) {
  const [view, setView] = useState<"split" | "editor" | "preview">("split")

  const handleViewChange = (newView: "split" | "editor" | "preview") => {
    setView(newView)
    onViewChange(newView)
  }

  return (
    <div className="hidden max-md:flex gap-1 border-r border-border pr-3">
      <Button
        onClick={() => handleViewChange("split")}
        variant={view === "split" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        title="Split View"
      >
        <Layout className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleViewChange("editor")}
        variant={view === "editor" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        title="Editor Only"
      >
        <Code className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleViewChange("preview")}
        variant={view === "preview" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        title="Preview Only"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  )
}
