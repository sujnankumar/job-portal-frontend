"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"
import api from "@/lib/axios"
import { useNotificationSocket } from "@/hooks/use-notification-socket"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, Mail, AlertTriangle, Briefcase, CalendarClock } from "lucide-react"
import { toIST } from "@/lib/utils"

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  useEffect(() => {
    if (!user?.token) return
    api.get("/notifications/", { params: { token: user.token } })
      .then(res => {
        setNotifications(res.data)
      })
  }, [user?.token, setNotifications])

  useNotificationSocket({
    token: user?.token || null,
    onNotification: (notification) => {
      if (notification.type === "ping" || !notification.id) return;
      addNotification(notification)
    }
  })

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-dark-gray flex items-center gap-2">
          <Bell className="h-7 w-7 text-accent" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="text-accent border-accent/30 hover:bg-accent/10 text-sm">
            Mark all as read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bell className="h-12 w-12 mb-4" />
          <div className="text-lg font-medium">No notifications yet</div>
          <div className="text-sm mt-1">You'll see important updates here.</div>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.filter(n => n && n.id).map((notification) => {
            const hasLink = typeof notification.link === 'string' && notification.link.trim() !== ''
            const Wrapper: any = hasLink ? Link : 'div'
            const wrapperProps = hasLink ? { href: notification.link } : {}
            const formatNotifTime = (t: string | null) => {
              if(!t) return ''
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
              <li
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm transition bg-white hover:bg-light-gray/70 ${notification.read ? 'opacity-70' : 'border-accent/60'}`}
              >
                <span className="mt-1">
                  {notification.type === "application" && <Briefcase className="h-6 w-6 text-accent" />}
                  {notification.type === "message" && <Mail className="h-6 w-6 text-blue-500" />}
                  {notification.type === "alert" && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  {notification.type === "job" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                  {notification.type === "interview" && <CalendarClock className="h-6 w-6 text-purple-500" />}
                </span>
                <Wrapper
                  {...wrapperProps}
                  className={`flex-1 group ${!hasLink ? 'cursor-default' : ''}`}
                  onClick={() => { if(hasLink) markAsRead(notification.id) }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-base text-dark-gray ${hasLink ? 'group-hover:text-accent transition-colors' : ''}`}>{notification.title}</span>
                    {!notification.read && <Badge className="bg-accent text-white ml-2">New</Badge>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{notification.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatNotifTime(notification.time)}</div>
                </Wrapper>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
