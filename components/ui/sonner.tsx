"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // Base toast: white background, subtle purple border, purple text
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-purple-900 group-[.toaster]:border-purple-200 group-[.toaster]:shadow-lg group-[.toaster]:shadow-purple-100/40",
          // Description in slightly softer purple
          description: "group-[.toast]:text-purple-700",
            // Action button: solid purple with white text
          actionButton:
            "group-[.toast]:bg-purple-600 group-[.toast]:text-white group-[.toast]:hover:bg-purple-600/90 group-[.toast]:focus-visible:ring-purple-500",
          // Cancel button: light purple background with darker purple text
          cancelButton:
            "group-[.toast]:bg-purple-100 group-[.toast]:text-purple-800 group-[.toast]:hover:bg-purple-200",
          // Variant overrides (remove green/black defaults)
          success:
            "group-[.toaster]:bg-white bg-purple-50 border border-purple-300 text-purple-900 [&>svg]:text-purple-600",
          error:
            "group-[.toaster]:bg-white bg-purple-50 border border-purple-400 text-purple-900 [&>svg]:text-purple-700",
          info:
            "group-[.toaster]:bg-white bg-purple-50 border border-purple-200 text-purple-900 [&>svg]:text-purple-600",
          warning:
            "group-[.toaster]:bg-white bg-purple-100 border border-purple-300 text-purple-900 [&>svg]:text-purple-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
