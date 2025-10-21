"use client"

import { useState } from "react"
import { Trash2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/project"

interface ProjectManagerProps {
  isOpen: boolean
  projects: Project[]
  onClose: () => void
  onSelect: (project: Project) => void
  onDelete: (projectId: string) => void
  onExport: (project: Project) => void
}

export function ProjectManager({ isOpen, projects, onClose, onSelect, onDelete, onExport }: ProjectManagerProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project) => (
                <div key={project.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.files.length} file{project.files.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button onClick={() => onSelect(project)} size="sm" className="bg-accent hover:bg-accent/90">
                        Open
                      </Button>
                      <Button onClick={() => onExport(project)} variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(project.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {confirmDelete === project.id && (
                    <div className="mt-3 p-3 bg-destructive/10 rounded border border-destructive/20 flex items-center justify-between">
                      <p className="text-sm text-destructive">Delete this project?</p>
                      <div className="flex gap-2">
                        <Button onClick={() => setConfirmDelete(null)} variant="outline" size="sm" className="h-7">
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            onDelete(project.id)
                            setConfirmDelete(null)
                          }}
                          size="sm"
                          className="h-7 bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
