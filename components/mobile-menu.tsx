"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  onNew: () => void
  onLoad: () => void
  onExport: () => void
}

export function MobileMenu({ onNew, onLoad, onExport }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="hidden max-sm:block">
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 right-0 bg-card border border-border rounded-lg p-2 space-y-1 z-40">
          <Button onClick={onNew} variant="ghost" size="sm" className="w-full justify-start">
            New Project
          </Button>
          <Button onClick={onLoad} variant="ghost" size="sm" className="w-full justify-start">
            Load Project
          </Button>
          <Button onClick={onExport} variant="ghost" size="sm" className="w-full justify-start">
            Export
          </Button>
        </div>
      )}
    </div>
  )
}
