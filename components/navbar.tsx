"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import NotificationBadge from "@/components/notification-badge"
import { useAuthStore } from "@/store/authStore"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    ...(isAuthenticated && user?.role === "applicant" ? [{ name: "Applications", path: "/applications" }] : []),
    ...(isAuthenticated && user?.role === "employer" ? [{ name: "Dashboard", path: "/employer/dashboard" }] : []),
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/abstract-geometric-logo.png" alt="JobPortal Logo" width={40} height={40} className="mr-2" />
            <span className="text-xl font-bold text-dark-gray">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "text-gray-600 hover:text-accent transition-colors",
                  isActive(link.path) && "text-accent font-medium",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <NotificationBadge count={3} />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Image
                        src={user?.avatar || "/mystical-forest-spirit.png"}
                        width={32}
                        height={32}
                        className="rounded-full"
                        alt="Profile"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.role === "applicant" ? (
                      <>
                        <DropdownMenuItem>
                          <Link href="/profile" className="flex w-full">
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/applications" className="flex w-full">
                            Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/saved-jobs" className="flex w-full">
                            Saved Jobs
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard" className="flex w-full">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard/post-job" className="flex w-full">
                            Post a Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard/settings" className="flex w-full">
                            Company Profile
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Only show Post a Job button for employers */}
                {user?.role === "employer" && (
                  <Button className="bg-accent hover:bg-accent/90">
                    <Link href="/employer/dashboard/post-job">Post a Job</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-accent hover:bg-accent/90">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "text-gray-600 hover:text-accent transition-colors py-2",
                    isActive(link.path) && "text-accent font-medium",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {isAuthenticated ? (
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <Image
                    src={user?.avatar || "/mystical-forest-spirit.png"}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                    alt="Profile"
                  />
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {user?.role === "applicant" ? (
                    <>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Profile
                        </Button>
                      </Link>
                      <Link href="/applications" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Applications
                        </Button>
                      </Link>
                      <Link href="/saved-jobs" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Saved Jobs
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/employer/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/employer/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Company Profile
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>

                {/* Only show Post a Job button for employers */}
                {user?.role === "employer" && (
                  <Link href="/employer/dashboard/post-job" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-accent hover:bg-accent/90">Post a Job</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-accent hover:bg-accent/90">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
