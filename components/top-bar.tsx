"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Save, Upload, Download, Loader2, LogOut, Settings } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface TopBarProps {
  projectName: string
  isSaving?: boolean
  onSave: () => void
  onNew: () => void
  onLoad: () => void
  onExport?: () => void
  onImport?: (file: File) => Promise<void>
  onDeploy?: () => void
  isAuthenticated?: boolean
  onLogout?: () => void
  onShowAuth?: () => void
}

export function TopBar({
  projectName,
  isSaving,
  onSave,
  onNew,
  onLoad,
  onExport,
  onImport,
  onDeploy,
  isAuthenticated,
  onLogout,
  onShowAuth,
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImport) {
      setIsImporting(true)
      try {
        await onImport(file)
      } catch (err) {
        console.error("Import failed:", err)
        alert("Failed to import project")
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-header">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            CS
          </div>
          <h1 className="text-xl font-bold">CipherStudio</h1>
        </div>
        
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onNew} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Plus className="w-4 h-4" />
          New
        </Button>
        <Button onClick={onLoad} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Upload className="w-4 h-4" />
          Load
        </Button>
        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
        {onDeploy && (
          <Button onClick={onDeploy} variant="outline" size="sm" className="gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Deploy
          </Button>
        )}
        {onImport && (
          <>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={isImporting}
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import
            </Button>
          </>
        )}
        <ThemeSwitcher />
        <Button onClick={onSave} variant="outline" size="sm" className="gap-2 bg-transparent" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {!isAuthenticated && onShowAuth && (
          <Button onClick={onShowAuth} variant="outline" size="sm" className="gap-2 bg-transparent">
            Sign In
          </Button>
        )}
        {isAuthenticated && onLogout && (
          <Button onClick={onLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  )
}
