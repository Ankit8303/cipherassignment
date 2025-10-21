"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

export function ThemeSwitcher() {
  const { theme, toggleTheme, isMounted } = useTheme()

  if (!isMounted) return null

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-muted"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
    </Button>
  )
}
