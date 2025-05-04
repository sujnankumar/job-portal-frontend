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
import api from "@/lib/axios"
import { useNotificationSocket } from "@/hooks/use-notification-socket"
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
      addNotification(notification)
    }
  })

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
                href={notification.link || "#"}
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
