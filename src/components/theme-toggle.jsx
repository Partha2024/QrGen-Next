"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button className="h-5 w-full font-normal justify-start" variant="ghost" size="icon"
      onClick={() => setTheme(theme === "light" ? "light" : "dark")}>
      Toggle theme
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  )
}