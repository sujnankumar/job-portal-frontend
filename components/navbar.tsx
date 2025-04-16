"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MenuIcon, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import NotificationBadge from "@/components/notification-badge"

const applicantNavigation = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobs" },
  { name: "Companies", href: "/companies" },
  { name: "Salary Guide", href: "/salary" },
  { name: "Career Advice", href: "/advice" },
]

const employerNavigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/employer/dashboard" },
  { name: "Post a Job", href: "/employer/dashboard/post-job" },
  { name: "Candidates", href: "/employer/dashboard/candidates" },
  { name: "Resources", href: "/employer/resources" },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const navigation = user?.role === "employer" ? employerNavigation : applicantNavigation

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="sr-only">JobHunt</span>
              <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">JH</span>
              </div>
              <span className="ml-2 text-xl font-bold text-dark-gray">JobHunt</span>
            </Link>

            <nav className="hidden md:ml-10 md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium px-2 py-1 rounded-md hover:bg-light-gray transition-colors",
                    pathname === item.href ? "text-accent font-semibold" : "text-dark-gray",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <NotificationBadge />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                          <Link href="/profile" className="w-full">
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/applications" className="w-full">
                            Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/saved-jobs" className="w-full">
                            Saved Jobs
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard" className="w-full">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard/post-job" className="w-full">
                            Post a Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard/settings" className="w-full">
                            Company Profile
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      <Link href="/settings" className="w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {user?.role === "employer" && (
                  <Button className="bg-accent hover:bg-accent/90 ml-2">
                    <Link href="/employer/dashboard/post-job">Post a Job</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-accent hover:bg-accent/90">Register</Button>
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <Button variant="ghost" className="relative" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 py-3 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block py-2 text-base font-medium hover:bg-light-gray rounded-md px-3",
                  pathname === item.href ? "text-accent font-semibold" : "text-dark-gray",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={user?.avatar || "/mystical-forest-spirit.png"}
                        width={40}
                        height={40}
                        className="rounded-full"
                        alt="Profile"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-dark-gray">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-3">
                    {user?.role === "applicant" ? (
                      <>
                        <Link
                          href="/profile"
                          className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/applications"
                          className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Applications
                        </Link>
                        <Link
                          href="/saved-jobs"
                          className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Saved Jobs
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/employer/dashboard"
                          className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/employer/dashboard/post-job"
                          className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Post a Job
                        </Link>
                      </>
                    )}
                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block w-full text-left px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1 px-3">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-base font-medium text-dark-gray hover:bg-light-gray rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
