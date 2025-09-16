"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Bell, LogOut, Crown, Unlock, Briefcase, Rocket, Flame, Loader2 } from "lucide-react"
import axios from "@/lib/axios"
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
import { DEFAULT_USER_AVATAR } from "@/lib/placeholders"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
// import { useChatStore } from "@/store/chatStore"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  // const unreadChatThreads = useChatStore(s => s.unreadThreadCount)
  // const refreshChatThreads = useChatStore(s => s.refreshFromServer)

  // Real subscription plan state
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchPlan = async () => {
      if (!isAuthenticated || user?.role !== 'employer' || !user?.token) {
        setSubscriptionPlan(null)
        return
      }
      setPlanLoading(true)
      try {
        const res = await api.get('/subscription/me', { headers: { Authorization: `Bearer ${user.token}` } })
        if (!cancelled) {
          const pid = res.data?.subscription?.plan_id || 'free'
            setSubscriptionPlan(pid)
        }
      } catch (e) {
        if (!cancelled) setSubscriptionPlan('free')
      } finally {
        if (!cancelled) setPlanLoading(false)
      }
    }
    fetchPlan()
  return () => { cancelled = true }
  }, [isAuthenticated, user?.role, user?.token])

  // Plan icon
  const getPlanIcon = (plan: string | null) => {
    switch (plan) {
      case "free": return <Unlock className="h-4 w-4 mr-2" />
      case "basic": return <Briefcase className="h-4 w-4 mr-2" />
      case "pro": return <Rocket className="h-4 w-4 mr-2" />
      case "premium": return <Flame className="h-4 w-4 mr-2" />
      case "enterprise": return <Crown className="h-4 w-4 mr-2" />
      default: return <Crown className="h-4 w-4 mr-2" />
    }
  }
  // Plan display name
  const getPlanDisplayName = (plan: string | null) => {
    if (!plan) return "Free Plan"
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setScrolled(true)
      else setScrolled(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch profile photo or company logo
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!isAuthenticated || !user?.token) {
        setProfileUrl(null)
        return
      }

      setProfileLoading(true)
      try {
        let res
        if (user?.role === "employer") {
          // For employers, fetch company logo
          // First get user details to get company info
          const userRes = await axios.get("/user/me", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })
          const userData = userRes.data
          
          if (userData.company_id) {
            // Fetch company logo using the logo_id
            res = await axios.get(`/company/logo/company/${userData.company_id}`, {
              responseType: "blob",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            })
          } else {
            // No logo_file_id, use default
            setProfileUrl(null)
            setProfileLoading(false)
            return
          }
        } else {
          // For applicants, fetch profile photo
          res = await axios.get("/profile/profile_photo", {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })
        }
        
        const url = URL.createObjectURL(res.data)
        setProfileUrl(url)
      } catch (error) {
        console.error("Failed to fetch profile image:", error)
        setProfileUrl(null)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileImage()

    // Cleanup function to revoke object URL
    return () => {
      if (profileUrl) {
        URL.revokeObjectURL(profileUrl)
      }
    }
  }, [isAuthenticated, user?.token, user?.role])

  // Cleanup profile URL when component unmounts
  useEffect(() => {
    return () => {
      if (profileUrl) {
        URL.revokeObjectURL(profileUrl)
      }
    }
  }, [profileUrl])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Companies", path: "/companies" },
    ...(isAuthenticated && user?.role === "applicant"
      ? [
          { name: "Dashboard", path: "/dashboard" },
          // { name: "Chat", path: "/chat" }, // Chat option commented out
        ]
      : []),
    ...(isAuthenticated && user?.role === "employer"
      ? [
          { name: "Dashboard", path: "/employer/dashboard" },
          // { name: "Chat", path: "/employer/chat" }, // Chat option commented out
        ]
      : []),
  ]

  // // Initial fetch & window focus refresh
  // useEffect(()=>{
  //   if(!isAuthenticated || !user?.token) return
  //   refreshChatThreads(user.token)
  //   const onFocus = () => { if(user?.token) refreshChatThreads(user.token) }
  //   window.addEventListener('focus', onFocus)
  //   return ()=> window.removeEventListener('focus', onFocus)
  // }, [isAuthenticated, user?.token, refreshChatThreads])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white border-b border-gray-200"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/abstract-geometric-logo.png"
              alt="JobPortal Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="text-xl font-bold text-dark-gray font-sans">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              // const isChat = link.name === 'Chat'
              // const showBadge = isChat && unreadChatThreads > 0
              // if (isChat) return null // Chat option commented out
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "text-gray-700 font-semibold font-sans px-3 py-2 rounded-md transition-all duration-200 relative group overflow-hidden",
                    isActive(link.path) && "text-accent"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {link.name}
                    {/* {showBadge && (
                      <span className="inline-flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                        {unreadChatThreads > 99 ? '99+' : unreadChatThreads}
                      </span>
                    )} */}
                  </span>
                  <span
                    className={cn(
                      "absolute left-0 bottom-0 h-full w-full rounded-md -z-1 transition-all duration-300 pointer-events-none",
                      isActive(link.path)
                        ? "bg-accent/10 border-b-2 border-accent w-full"
                        : "group-hover:bg-accent/10 group-hover:border-b-2 group-hover:border-accent group-hover:w-full w-0"
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Subscription Button - Only for employers */}
                {user?.role === "employer" && (
                  <Link href="/subscribe">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 transform hover:scale-105 text-white rounded-full px-4 py-2 flex items-center">
                      {planLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : getPlanIcon(subscriptionPlan || 'free')}
                      <span>{subscriptionPlan === 'free' ? 'Upgrade' : getPlanDisplayName(subscriptionPlan)}</span>
                    </Button>
                  </Link>
                )}
                {/* Notification dropdown (removed wrapping Button to avoid nested button) */}
                <NotificationBadge />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-105 p-0 border-2 border-accent/60 shadow-md focus:ring-2 focus:ring-accent/40">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30">
                        {profileLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-accent" />
                        ) : (
                          <Image
                            src={profileUrl || user?.avatar || DEFAULT_USER_AVATAR}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full rounded-full"
                            alt={user?.role === "employer" ? "Company Logo" : "Profile"}
                          />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-lg border border-gray-200">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.role === "applicant" ? (
                      <>
                        <DropdownMenuItem>
                          <Link href="/profile" className="flex w-full">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/saved-jobs" className="flex w-full">Saved Jobs</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard" className="flex w-full">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/employer/dashboard/post-job" className="flex w-full">Post a Job</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/company" className="flex w-full">Company Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/subscribe" className="flex w-full">Subscription Plans</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex w-full">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer hover:bg-red-50 transition-colors duration-200">
                      <LogOut className="h-4 w-4 mr-2" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Only show Post a Job button for employers */}
                {user?.role === "employer" && (
                  <Link href="/employer/dashboard/post-job">
                    <Button className="bg-accent hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 rounded-lg">
                      Post a Job
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="transition-all duration-300 hover:bg-gray-100 rounded-lg">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-accent hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 rounded-lg">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="transition-all duration-300 hover:bg-gray-100 rounded-full"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                // const isChat = link.name === 'Chat'
                // const showBadge = isChat && unreadChatThreads > 0
                // if (isChat) return null // Chat option commented out
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      "flex items-center gap-2 text-gray-600 hover:text-accent transition-colors py-2 px-3 rounded-lg",
                      isActive(link.path) && "text-accent font-medium bg-gray-50"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{link.name}</span>
                    {/* {showBadge && (
                      <span className="inline-flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                        {unreadChatThreads > 99 ? '99+' : unreadChatThreads}
                      </span>
                    )} */}
                  </Link>
                )
              })}
              {/* Mobile Subscription Link - Only for employers */}
              {isAuthenticated && user?.role === "employer" && (
                <Link
                  href="/subscribe"
                  className="flex items-center text-gray-600 hover:text-accent transition-colors py-2 px-3 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {planLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : getPlanIcon(subscriptionPlan || 'free')}
                  <span className="ml-2">Subscription ({subscriptionPlan === 'free' ? 'Upgrade' : getPlanDisplayName(subscriptionPlan)})</span>
                </Link>
              )}
            </nav>
            {isAuthenticated ? (
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30">
                    {profileLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    ) : (
                      <Image
                        src={profileUrl || user?.avatar || DEFAULT_USER_AVATAR}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full rounded-full"
                        alt={user?.role === "employer" ? "Company Logo" : "Profile"}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {user?.role === "applicant" ? (
                    <>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg transition-colors duration-200 hover:bg-gray-100">Profile</Button>
                      </Link>
                      <Link href="/saved-jobs" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg transition-colors duration-200 hover:bg-gray-100">Saved Jobs</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/employer/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg transition-colors duration-200 hover:bg-gray-100">Dashboard</Button>
                      </Link>
                      <Link href="/company" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg transition-colors duration-200 hover:bg-gray-100">Company Profile</Button>
                      </Link>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 rounded-lg transition-colors duration-200 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />Logout
                  </Button>
                </div>
                {/* Only show Post a Job button for employers */}
                {user?.role === "employer" && (
                  <Link href="/employer/dashboard/post-job" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-accent hover:bg-accent/90 transition-all duration-300 rounded-lg">Post a Job</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full rounded-lg transition-colors duration-200 hover:bg-gray-100">Sign In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-accent hover:bg-accent/90 transition-all duration-300 rounded-lg">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
