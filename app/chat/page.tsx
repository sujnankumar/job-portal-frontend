"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import cn from "classnames"
import { useChatSocket } from "@/hooks/use-chat-socket"
import api from "@/lib/axios"
import { ChevronDown } from "lucide-react"

interface ChatUser {
  id: string
  name: string
  avatar?: string
  avatarUrl?: string | null // Add for blob URL
  avatarLoading?: boolean   // Add loading state
  lastMessage: string
  lastMessageTime: string
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  text: string
  time: string
}

export default function ApplicantChatPage() {
  console.log("ApplicantChatPage component rendering")
  
  const { user } = useAuthStore()
  const [recipients, setRecipients] = useState<ChatUser[]>([])
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
            const avatarUrl = await fetchProfilePhoto(recipient.id)
            return {
              ...recipient,
              avatarUrl,
              avatarLoading: false
            }
          })
        )
        console.log("hi")
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
        {loading ? (
          <div className="p-4 text-gray-400">Loading...</div>
        ) : recipients.length === 0 ? (
          <div className="p-4 text-gray-400">No chats yet.</div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {recipients.map((r) => (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer border-b hover:bg-accent/10 transition",
                  selectedId === r.id && "bg-accent/20 border-l-4 border-accent"
                )}
                onClick={() => setSelectedId(r.id)}
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
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 truncate">{r.lastMessage}</div>
                </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {r.lastMessageTime
                      ? (() => {
                          const timeNum = Number(r.lastMessageTime);
                          const date = !isNaN(timeNum)
                            ? new Date(timeNum > 1e12 ? timeNum : timeNum * 1000)
                            : new Date(r.lastMessageTime);
                          return isNaN(date.getTime())
                            ? ""
                            : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        })()
                      : ""}
                  </div>
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
              <div className="text-[10px] text-right text-gray-400 mt-1">{msg.time?.slice(11, 16)}</div>
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
