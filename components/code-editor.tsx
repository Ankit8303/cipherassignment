"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { ProjectFile } from "@/types/project"
import { useTheme } from "@/hooks/use-theme"

interface CodeEditorProps {
  file: ProjectFile | null
  onUpdateContent: (id: string, content: string) => void
}

export function CodeEditor({ file, onUpdateContent }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineCount, setLineCount] = useState(1)
  const { isDark, isMounted } = useTheme()

  useEffect(() => {
    if (textareaRef.current && file) {
      textareaRef.current.value = file.content
      updateLineCount()
    }
  }, [file])

  const updateLineCount = () => {
    if (textareaRef.current) {
      const lines = textareaRef.current.value.split("\n").length
      setLineCount(lines)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (e.key === "Tab") {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value

      // Insert tab character
      const newValue = value.substring(0, start) + "\t" + value.substring(end)
      textarea.value = newValue
      textarea.selectionStart = textarea.selectionEnd = start + 1

      // Update content
      if (file) {
        onUpdateContent(file.id, newValue)
      }
      updateLineCount()
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      // Save is handled by the parent component
    }

    if (e.key === "Enter") {
      setTimeout(updateLineCount, 0)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (file) {
      onUpdateContent(file.id, e.target.value)
    }
    updateLineCount()
  }

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">No file selected</p>
          <p className="text-sm">Create or select a file to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="px-4 py-3 border-b border-border bg-card">
        <p className="text-sm font-medium text-foreground">{file.name}</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="text-right px-3 py-4 font-mono text-sm select-none border-r border-border bg-muted text-muted-foreground">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none border-none bg-background text-foreground"
          spellCheck="false"
          style={{
            fontFamily: "Fira Code, monospace",
            lineHeight: "1.5",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  )
}
