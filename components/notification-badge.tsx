"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import api from "@/lib/axios"
import { useNotificationSocket } from "@/hooks/use-notification-socket"
import { toIST } from "@/lib/utils"
import { useNotificationStore } from "@/store/notificationStore"

export default function NotificationBadge() {
  const { user, hydrated } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  useEffect(() => {
    if (!hydrated || !user?.token) return
    api.get("/notifications/", { params: { token: user.token } })
      .then(res => {
        setNotifications(res.data)
      })
  }, [hydrated, user?.token, setNotifications])

  useNotificationSocket({
    token: hydrated ? user?.token || null : null,
    onNotification: (notification) => {
      if (notification.type === "ping" || !notification.id) return;
      addNotification(notification)
    }
  })

  // Show up to 3 notifications: prefer unread, fill with read if needed
  const sortedNotifications = [
    ...notifications.filter(n => n && n.id && !n.read),
    ...notifications.filter(n => n && n.id && n.read)
  ].slice(0, 3)

  const formatNotifTime = (t: string | null) => {
    if(!t) return ''
    // Ensure we parse as UTC when Z present
    const raw = t.endsWith('Z') ? new Date(t) : new Date(t)
    const d = toIST(raw)
    const now = toIST(new Date())
    const sameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }
    if(sameDay) return d.toLocaleTimeString('en-IN', opts)
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1)
    const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()
    if(isYesterday) return 'Yesterday ' + d.toLocaleTimeString('en-IN', opts)
    return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 bg-accent text-white">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs h-auto py-1 px-2 rounded-md hover:bg-accent/10 text-accent transition-colors"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortedNotifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">No notifications</div>
        ) : (
          sortedNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              <Link
                href={notification.link || "#"}
                className="flex w-full px-2 py-2 hover:bg-light-gray"
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`flex-1 ${!notification.read ? "font-medium" : ""}`}>
                  <div className="text-sm text-dark-gray">{notification.title}</div>
                  <div className="text-xs text-gray-500">{notification.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatNotifTime(notification.time)}</div>
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
