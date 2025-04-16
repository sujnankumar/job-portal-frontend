"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"

interface Notification {
  id: string
  type: "application" | "message" | "job" | "alert"
  title: string
  description: string
  time: string
  read: boolean
  link: string
}

export default function NotificationBadge() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuthStore()

  // Mock fetching notifications
  useEffect(() => {
    // In a real app, you would fetch notifications from an API
    const mockNotifications: Notification[] =
      user?.role === "employer"
        ? [
            {
              id: "1",
              type: "application",
              title: "New Application",
              description: "John Smith applied for Senior Frontend Developer",
              time: "10 minutes ago",
              read: false,
              link: "/employer/dashboard/applications/1",
            },
            {
              id: "2",
              type: "job",
              title: "Job Expiring Soon",
              description: "Your UX/UI Designer job posting expires in 2 days",
              time: "2 hours ago",
              read: false,
              link: "/employer/dashboard/jobs/2",
            },
            {
              id: "3",
              type: "message",
              title: "New Message",
              description: "Emily Johnson sent you a message about the interview",
              time: "Yesterday",
              read: true,
              link: "/employer/dashboard/messages/3",
            },
          ]
        : [
            {
              id: "1",
              type: "job",
              title: "New Job Match",
              description: "Senior Frontend Developer at Tech Innovations Inc.",
              time: "10 minutes ago",
              read: false,
              link: "/jobs/1",
            },
            {
              id: "2",
              type: "application",
              title: "Application Status",
              description: "Your application for UX/UI Designer has been viewed",
              time: "2 hours ago",
              read: false,
              link: "/applications",
            },
            {
              id: "3",
              type: "message",
              title: "Interview Invitation",
              description: "Tech Innovations Inc. invited you for an interview",
              time: "Yesterday",
              read: true,
              link: "/applications",
            },
          ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }, [user])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 bg-accent text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              <Link
                href={notification.link}
                className="flex w-full px-2 py-2 hover:bg-light-gray"
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`flex-1 ${!notification.read ? "font-medium" : ""}`}>
                  <div className="text-sm text-dark-gray">{notification.title}</div>
                  <div className="text-xs text-gray-500">{notification.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                </div>
                {!notification.read && <div className="w-2 h-2 rounded-full bg-accent self-start mt-2"></div>}
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm text-accent">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
