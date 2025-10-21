"use client"

import { X, Github, Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DeploymentModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onExportGithub: () => void
  onExportZip: () => void
}

export function DeploymentModal({ isOpen, onClose, projectName, onExportGithub, onExportZip }: DeploymentModalProps) {
  const [copied, setCopied] = useState(false)

  const deployUrl = `https://vercel.com/new?repository-url=https://github.com/yourusername/${projectName}`

  const copyDeployUrl = () => {
    navigator.clipboard.writeText(deployUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Deploy Project</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Export Options</h3>
            <div className="space-y-2">
              <Button onClick={onExportGithub} variant="outline" className="w-full gap-2 bg-transparent">
                <Github className="w-4 h-4" />
                Export to GitHub
              </Button>
              <Button onClick={onExportZip} variant="outline" className="w-full gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export as ZIP
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-2">Deploy to Vercel</h3>
            <p className="text-sm text-muted-foreground mb-3">
              After exporting to GitHub, use this link to deploy to Vercel:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={deployUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-muted-foreground"
              />
              <Button onClick={copyDeployUrl} size="sm" variant="outline" className="gap-2 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
