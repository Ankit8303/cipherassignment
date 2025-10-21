"use client"

import { useState } from "react"
import { File, Folder, FolderOpen, Plus, Trash2, Edit2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProjectFile } from "@/types/project"

interface FileTreeProps {
  files: ProjectFile[]
  selectedFile: ProjectFile | null
  onSelectFile: (file: ProjectFile) => void
  onCreateFile: (name: string, parentId?: string) => void
  onDeleteFile: (id: string) => void
  onRenameFile: (id: string, newName: string) => void
}

export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileTreeProps) {
  const [newFileName, setNewFileName] = useState("")
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamingValue, setRenamingValue] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName)
      setNewFileName("")
      setShowNewFileInput(false)
    }
  }

  const handleRename = (id: string, currentName: string) => {
    setRenamingId(id)
    setRenamingValue(currentName)
  }

  const handleSaveRename = (id: string) => {
    if (renamingValue.trim()) {
      onRenameFile(id, renamingValue)
      setRenamingId(null)
    }
  }

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileItem = (file: ProjectFile, level = 0) => (
    <div key={file.id}>
      <div
        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ml- text-orange-600${level * 4} ${
          selectedFile?.id === file.id && file.type === "file"
            ? "bg-accent/20 text-accent"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => file.type === "file" && onSelectFile(file)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {file.type === "folder" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(file.id)
                }}
                className="p-0 hover:bg-muted rounded"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${expandedFolders.has(file.id) ? "rotate-90" : ""}`}
                />
              </button>
              {expandedFolders.has(file.id) ? (
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 flex-shrink-0" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 flex-shrink-0 text-foreground" />
            </>
          )}

          {renamingId === file.id ? (
            <Input
              autoFocus
              value={renamingValue}
              onChange={(e) => setRenamingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename(file.id)
                if (e.key === "Escape") setRenamingId(null)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 text-sm flex-1"
            />
          ) : (
            <span className="text-sm truncate text-foreground">{file.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleRename(file.id, file.name)
            }}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <Edit2 className="w-3 h-3 text-foreground" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteFile(file.id)
            }}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="w-3 h-3 text-foreground" />
          </Button>
        </div>
      </div>

      {file.type === "folder" && expandedFolders.has(file.id) && file.children && (
        <div>{file.children.map((child) => renderFileItem(child, level + 1))}</div>
      )}
    </div>
  )

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Files</h2>
        <Button onClick={() => setShowNewFileInput(true)} variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showNewFileInput && (
        <div className="flex gap-2 mb-2">
          <Input
            autoFocus
            placeholder="file.tsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFile()
              if (e.key === "Escape") setShowNewFileInput(false)
            }}
            className="h-8 text-sm"
          />
          <Button onClick={handleCreateFile} size="sm" className="h-8 bg-accent hover:bg-accent/90">
            Create
          </Button>
        </div>
      )}

      <div className="space-y-1">{files.map((file) => renderFileItem(file))}</div>

      {files.length === 0 && !showNewFileInput && (
        <div className="text-xs text-muted-foreground text-center py-4">No files yet. Create one to start!</div>
      )}
    </div>
  )
}
