"use client"

import { useTheme } from "next-themes"
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Éviter l'hydratation côté serveur
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  )
}

