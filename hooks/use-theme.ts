"use client"

import { useEffect, useState } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Load theme from localStorage
    const saved = localStorage.getItem("cipher-studio-theme")
    if (saved === "light" || saved === "dark") {
      setTheme(saved)
      applyTheme(saved)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"
      setTheme(initialTheme)
      applyTheme(initialTheme)
    }
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement
    if (newTheme === "dark") {
      html.classList.add("dark")
      html.classList.remove("light")
    } else {
      html.classList.remove("dark")
      html.classList.add("light")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("cipher-studio-theme", newTheme)
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: newTheme } }))
  }

  return { theme, toggleTheme, isMounted, isDark: theme === "dark" }
}
