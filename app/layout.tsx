import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
// Using sonner toaster for unified bottom-right notifications
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobHunt - Find Your Dream Job",
  description: "Modern job portal to help you find your next career opportunity",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 bg-light-cream">{children}</main>
          <Footer />
        </div>
  <Toaster
    position="bottom-right"
    closeButton
    expand={false}
    // Remove richColors to prevent default green/black palette
    toastOptions={{
      classNames: {
        toast: "bg-white border border-purple-200 text-purple-900 shadow-lg shadow-purple-100/40",
        success: "bg-white border border-purple-300 text-purple-900 [&>svg]:text-purple-600",
        error: "bg-white border border-purple-400 text-purple-900 [&>svg]:text-purple-700",
        warning: "bg-white border border-purple-300 text-purple-900 [&>svg]:text-purple-700",
        info: "bg-white border border-purple-200 text-purple-900 [&>svg]:text-purple-600",
        actionButton: "bg-purple-600 text-white hover:bg-purple-600/90",
        cancelButton: "bg-purple-100 text-purple-800 hover:bg-purple-200"
      }
    }}
  />
      </body>
    </html>
  )
}
