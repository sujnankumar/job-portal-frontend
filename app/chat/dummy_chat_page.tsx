"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import cn from "classnames"
import { useChatSocket } from "@/hooks/use-chat-socket"
import api from "@/lib/axios"
import { formatChatTime, formatChatTimestampSmart } from "@/lib/utils"
import { useChatStore } from "@/store/chatStore"
import { ChevronDown } from "lucide-react"
import { notFound } from 'next/navigation'

interface ChatUser {
  id: string
  name: string // employer personal name (used in header)
  company_name?: string // new: display in list for employer chats
  company_id?: string
  company_logo?: string | null
  avatar?: string
  avatarUrl?: string | null // blob URL (either user avatar or company logo)
  avatarLoading?: boolean
  lastMessage: string
  lastMessageTime: string
  lastMessageTimestamp?: string
  unreadCount?: number
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  text: string
  time: string
}

export default function ApplicantChatPage() {

  // Force 404 on mount
  useEffect(() => {
    notFound();
  }, []);
  console.log("ApplicantChatPage component rendering")
  
  const { user } = useAuthStore()
  const [recipients, setRecipients] = useState<ChatUser[]>([])
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [chats, setChats] = useState<Record<string, Message[]>>({})
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const setInitialUnread = useChatStore(s=> s.setInitial)
  const incrementUnread = useChatStore(s=> s.incrementUnread)
  const clearThreadUnread = useChatStore(s=> s.clearThread)
  const unreadMap = useChatStore(s=> s.unreadByThread)

  // Sync store unread counts into recipients (initial page open or external updates)
  useEffect(() => {
    if(!recipients.length) return
    setRecipients(prev => prev.map(r => {
      const storeVal = unreadMap[r.id]
      if(typeof storeVal === 'number' && storeVal !== (r.unreadCount||0)){
        return { ...r, unreadCount: storeVal }
      }
      return r
    }))
  }, [unreadMap])

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const min = 200, max = 500
      let newWidth = e.clientX - (sidebarRef.current?.getBoundingClientRect().left || 0)
      if (newWidth < min) newWidth = min
      if (newWidth > max) newWidth = max
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => { isResizing.current = false }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Fetch token from user store
  useEffect(() => {
    console.log("useEffect triggered, user:", user)
    console.log("user?.token:", user?.token)
    console.log("user?.role:", user?.role)
    console.log("Fetching token from user store")
    setToken(user?.token || null)
  }, [user])

  // Function to fetch profile photo for a user
  const fetchProfilePhoto = async (userId: string): Promise<string | null> => {
    if (!token) return null
    try {
      const response = await api.get(`/chat/chat/profile-photo/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      return URL.createObjectURL(response.data)
    } catch (error) {
      // Log error but don't show it to user - we'll show fallback avatar
      console.log("No profile photo found for user:", userId)
      return null
    }
  }

  // Fetch recipients with profile photos
  useEffect(() => {
    if (!token) return
    setLoading(true)
    
  api.get("/chat/chat/recipients", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const recipientsData = res.data
        // Initialize global unread mapping
        const unreadMap: Record<string, number> = {}
        recipientsData.forEach((r: ChatUser)=> { unreadMap[r.id] = r.unreadCount || 0 })
        setInitialUnread(unreadMap)
        
        // Set initial state with loading flags
        const recipientsWithLoading = recipientsData.map((recipient: ChatUser) => ({
          ...recipient,
          avatarUrl: null,
          avatarLoading: true
        }))
        setRecipients(recipientsWithLoading)
        
        // Fetch profile photos for each recipient
        const recipientsWithPhotos = await Promise.all(
          recipientsData.map(async (recipient: ChatUser) => {
            // Prefer company logo when company_name exists
            let avatarUrl: string | null = null
            if (recipient.company_name && recipient.company_logo) {
              // If backend returns a GridFS id for logo we'll need another endpoint to fetch by company id.
              // For now attempt to treat company_logo as potential file id -> we can reuse profile-photo endpoint on employer user id.
              avatarUrl = await fetchProfilePhoto(recipient.id)
            } else {
              avatarUrl = await fetchProfilePhoto(recipient.id)
            }
            return {
              ...recipient,
              avatarUrl,
              avatarLoading: false
            }
          })
        )
        setRecipients(recipientsWithPhotos)
      })
      .catch((error) => {
        console.error("Failed to fetch recipients:", error)
      })
      .finally(() => setLoading(false))
  }, [token])

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      recipients.forEach(recipient => {
        if (recipient.avatarUrl) {
          URL.revokeObjectURL(recipient.avatarUrl)
        }
      })
    }
  }, [recipients])

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedId || !token) return
    api.get(`/chat/chat/messages/${selectedId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setChats(prev => ({ ...prev, [selectedId]: res.data }))
      })
  }, [selectedId, token])

  // WebSocket for real-time chat
  useChatSocket({
    recipientId: selectedId,
    token,
    onMessage: (msg) => {
      setChats(prev => ({
        ...prev,
        [msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id]: [
          ...(prev[msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id] || []),
          msg
        ]
      }))
      const partnerId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id
      const incoming = msg.sender_id !== user?.id
      const active = selectedId === partnerId
      setRecipients(prev => {
        const idx = prev.findIndex(r => r.id === partnerId)
        if(idx === -1){
          // unknown partner: refresh full list once
          if(token){
            api.get('/chat/chat/recipients', { headers: { Authorization: `Bearer ${token}` } }).then(res=>{
              const data: ChatUser[] = res.data
              const unreadMap: Record<string, number> = {}
              data.forEach(d=> unreadMap[d.id] = d.unreadCount || 0)
              setInitialUnread(unreadMap)
              setRecipients(data)
            }).catch(()=>{})
          }
          return prev
        }
        const current = prev[idx]
        const newUnread = incoming ? (active ? 0 : ( (current.unreadCount||0) + 1)) : current.unreadCount
        const updatedItem: ChatUser = { ...current, lastMessage: msg.text, lastMessageTimestamp: msg.time, unreadCount: newUnread }
        const list = [...prev]
        list[idx] = updatedItem
        list.sort((a,b)=>{
          const ta = a.lastMessageTimestamp ? Date.parse(a.lastMessageTimestamp) : 0
          const tb = b.lastMessageTimestamp ? Date.parse(b.lastMessageTimestamp) : 0
          return tb - ta
        })
        return list
      })
      if(incoming){
        if(active){
          api.post(`/chat/chat/mark-read/${partnerId}`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(()=>{})
          clearThreadUnread(partnerId)
        } else {
          incrementUnread(partnerId)
        }
      }
    }
  })

  const messages = selectedId ? chats[selectedId] || [] : []

  // Scroll to bottom on new message (only chat window)
  useEffect(() => {
    if (!showScrollDown && messagesEndRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, showScrollDown])

  // Show scroll down button if user scrolls up
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10
      setShowScrollDown(!atBottom)
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Send message
  const { send } = useChatSocket({
    recipientId: selectedId,
    token,
    onMessage: () => {},
  })
  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedId) return
    send({ text: input })
    setInput("")
  }, [input, selectedId, send])

  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow border overflow-hidden mt-8 max-w-5xl mx-auto">
      {/* Left: Recipients */}
      <div
        ref={sidebarRef}
        className="border-r bg-gray-50 flex flex-col relative select-none"
        style={{ width: sidebarWidth }}
      >
        <div className="p-4 font-bold text-lg border-b">Chats</div>
        <div className="p-2 border-b">
          <div className="relative group">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search company or recruiter..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 border rounded focus:outline-accent focus:ring-2 focus:ring-accent/30 bg-white placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={()=>setSearch("")}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Loading...</div>
        ) : recipients.length === 0 ? (
          <div className="p-4 text-gray-400">No chats yet.</div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {recipients
              .filter(r => {
                if(!search.trim()) return true
                const hay = (r.company_name || "") + " " + (r.name || "")
                return hay.toLowerCase().includes(search.toLowerCase())
              })
              .map((r) => (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer border-b hover:bg-accent/10 transition",
                  selectedId === r.id && "bg-accent/20 border-l-4 border-accent"
                )}
                onClick={() => {
                  setSelectedId(r.id)
                  // Mark read optimistically
                  if(r.unreadCount && r.unreadCount > 0){
                    setRecipients(prev => prev.map(p=> p.id===r.id? {...p, unreadCount:0}:p))
                    api.post(`/chat/chat/mark-read/${r.id}`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(()=>{})
                    clearThreadUnread(r.id)
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300">
                  {r.avatarLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {r.avatarUrl ? (
                        <Image 
                          src={r.avatarUrl} 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover" 
                          alt={r.name} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {(r.company_name || r.name).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.company_name || r.name}</div>
                  <div className="text-xs text-gray-500 truncate">{r.company_name ? r.name : r.company_name}</div>
                  <div className="text-xs text-gray-500 truncate">{r.lastMessage}</div>
                </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {(() => {
                      const raw = r.lastMessageTimestamp || r.lastMessageTime;
                      // Suppress placeholder/invalid values like "0"
                      if (!raw || raw === "0") return "";
                      // Try full timestamp first
                      let date = new Date(raw);
                      if (isNaN(date.getTime())) {
                        // If numeric epoch seconds/millis
                        const num = Number(raw);
                        if (!isNaN(num)) {
                          date = new Date(num > 1e12 ? num : num * 1000);
                        }
                      }
                      return isNaN(date.getTime()) ? "" : formatChatTime(date);
                    })()}
                  </div>
                    {(r.unreadCount ?? 0) > 0 && (
                      <div className="ml-2 bg-accent text-white rounded-full min-w-5 h-5 flex items-center justify-center text-[10px] px-1">
                        {(r.unreadCount ?? 0) > 99 ? '99+' : (r.unreadCount ?? 0)}
                      </div>
                    )}
              </li>
            ))}
          </ul>
        )}
        {/* Resizer */}
        <div
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10"
          onMouseDown={() => { isResizing.current = true }}
        />
      </div>
      {/* Right: Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b font-semibold bg-gray-50 flex items-center gap-3">
          {selectedId ? (recipients.find((r) => r.id === selectedId)?.name || "Chat") : "Select a chat"}
        </div>
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white relative">
          {selectedId && messages.length > 0 ? messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-lg text-sm transition-all break-words",
                msg.sender_id === user?.id ? "ml-auto bg-accent text-white text-right" : "bg-gray-100 text-gray-800 text-left",
                "py-2 px-4"
              )}
              style={{
                maxWidth: '60%',
                width: 'fit-content',
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
                display: 'block',
              }}
            >
              {msg.text}
              <div className="text-[10px] text-right text-gray-400 mt-1">{formatChatTimestampSmart(msg.time)}</div>
            </div>
          )) : (
            <div className="text-gray-400 text-center mt-10">{selectedId ? "No messages yet." : "Select a chat to start messaging."}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {showScrollDown && (
          <div className="w-full flex justify-center mb-2">
            <button
              className="rounded-full bg-accent text-white hover:bg-yellow-400 hover:text-black shadow transition flex items-center justify-center"
              style={{ width: 36, height: 36 }}
              onClick={() => {
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
                setShowScrollDown(false)
              }}
              aria-label="Scroll to latest"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        )}
        <form className="p-4 border-t flex gap-2 bg-gray-50" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-accent"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoComplete="off"
            disabled={!selectedId}
          />
          <Button type="submit" className="bg-accent" disabled={!selectedId}>Send</Button>
        </form>
      </div>
    </div>
  )
}
