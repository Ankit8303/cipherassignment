"use client"

import { X, Github, Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { githubService, GitHubFile } from "@/lib/github"
import { Project } from "@/types/project"

interface GitHubExportModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  files: any[]
}

export function GitHubExportModal({ isOpen, onClose, project, files }: GitHubExportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null)
  const [repoName, setRepoName] = useState(project?.name?.replace(/\s+/g, '-').toLowerCase() || 'my-project')
  const [repoDescription, setRepoDescription] = useState(`Exported from CipherStudio: ${project?.name || 'My Project'}`)
  const [isPrivate, setIsPrivate] = useState(false)

  const handleExport = async () => {
    if (!project) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Create repository
      const repoResult = await githubService.createRepository({
        name: repoName,
        description: repoDescription,
        private: isPrivate
      })

      if (!repoResult.success) {
        throw new Error(repoResult.error || 'Failed to create repository')
      }

      setRepositoryUrl(repoResult.url || null)

      // Convert files to GitHub format
      const githubFiles: GitHubFile[] = files.map(file => ({
        path: file.name,
        content: file.content,
        type: 'file' as const
      }))

      // Add package.json for React projects
      const packageJson = {
        name: repoName,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint"
        },
        dependencies: {
          "next": "14.0.0",
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        }
      }

      githubFiles.push({
        path: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        type: 'file'
      })

      // Add README.md
      githubFiles.push({
        path: 'README.md',
        content: `# ${project.name}

This project was exported from CipherStudio.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Files

${files.map(file => `- \`${file.name}\``).join('\n')}
`,
        type: 'file'
      })

      // Upload files
      const uploadResult = await githubService.uploadFiles(repoName, githubFiles)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload files')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to GitHub')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Github className="w-5 h-5" />
            Export to GitHub
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Successfully exported to GitHub!</span>
            </div>
            
            {repositoryUrl && (
              <div className="p-3 bg-muted rounded border">
                <p className="text-sm text-muted-foreground mb-2">Your repository:</p>
                <a 
                  href={repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {repositoryUrl}
                </a>
              </div>
            )}

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                  placeholder="my-project"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                  rows={2}
                  placeholder="Project description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="private" className="text-sm">
                  Private repository
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleExport} 
                disabled={isLoading || !repoName.trim()}
                className="flex-1 gap-2 bg-transparent"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Upload className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    Export to GitHub
                  </>
                )}
              </Button>
              <Button onClick={onClose} variant="outline" className="bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
