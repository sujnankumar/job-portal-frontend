"use client"
import React, { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useNotificationStore } from "@/store/notificationStore"
import api from "@/lib/axios"
import { useNotificationSocket } from "@/hooks/use-notification-socket"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, Mail, AlertTriangle, Briefcase, CalendarClock, MoreVertical, CheckSquare, Square, Trash2 } from "lucide-react"
import { toIST } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const toggleRead = useNotificationStore((s) => s.toggleRead)
  const deleteNotification = useNotificationStore((s) => s.deleteNotification)
  const deleteNotifications = useNotificationStore((s) => s.deleteNotifications)

  const [selectionMode, setSelectionMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const clearSelection = () => { setSelectedIds(new Set()); setSelectionMode(false) }

  const bulkDelete = () => {
    if(selectedIds.size === 0) return
    deleteNotifications(Array.from(selectedIds))
    toast.success(`Deleted ${selectedIds.size} notification${selectedIds.size>1?'s':''}`)
    clearSelection()
  }

  // Exit selection mode automatically if list becomes empty
  useEffect(() => {
    if (notifications.length === 0 && selectionMode) {
      setSelectionMode(false)
      setSelectedIds(new Set())
    }
  }, [notifications.length, selectionMode])

  const handleMarkAllRead = () => {
    if(unreadCount === 0) return
    markAllAsRead()
    toast.success('All notifications marked as read')
  }

  const handleToggleRead = (id: string) => {
    const target = notifications.find(n => n.id === id)
    const wasRead = !!target?.read
    toggleRead(id)
    toast.success(wasRead ? 'Marked as unread' : 'Marked as read')
  }

  const handleDeleteSingle = (id: string) => {
    deleteNotification(id)
    toast.success('Notification deleted')
  }

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
      toast.info(notification.title || 'New notification', { description: notification.description?.slice(0, 120) })
    }
  })

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-dark-gray flex items-center gap-2">
            <Bell className="h-7 w-7 text-accent" /> Notifications
          </h1>
          {selectionMode && (
            <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button onClick={() => setSelectionMode(m => !m)} variant="outline" className="text-xs md:text-sm">
              {selectionMode ? 'Cancel' : 'Select'}
            </Button>
          )}
          {selectionMode && selectedIds.size > 0 && (
            <Button onClick={bulkDelete} variant="outline" className="text-red-600 border-red-400 hover:bg-red-50 text-xs md:text-sm flex items-center gap-1">
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
          )}
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="outline" className="text-accent border-accent/30 hover:bg-accent/10 text-xs md:text-sm">
              Mark all as read
            </Button>
          )}
        </div>
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
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm transition bg-white hover:bg-light-gray/70 relative ${notification.read ? 'opacity-70' : 'border-accent/60'}`}
              >
                {selectionMode && (
                  <button
                    onClick={() => toggleSelect(notification.id)}
                    className="absolute -left-3 top-4 bg-white rounded-full border shadow p-1"
                  >
                    {selectedIds.has(notification.id) ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 text-gray-400" />}
                  </button>
                )}
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
                {!selectionMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-md hover:bg-light-gray/80 text-gray-500 transition" aria-label="More actions" title="More actions">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => handleToggleRead(notification.id)}>
                        {notification.read ? 'Mark as unread' : 'Mark as read'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteSingle(notification.id)} className="text-red-600 focus:bg-red-50">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
