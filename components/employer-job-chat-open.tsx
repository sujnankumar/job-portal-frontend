"use client"
import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { Send, X, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatChatTime } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useChatSocket } from "@/hooks/use-chat-socket"
import api from "@/lib/axios"

interface Message {
  id: string
  sender_id: string
  text: string
  timestamp: Date
  read: boolean
}

interface EmployerJobChatProps {
  jobId: string
  applicantId: string
  applicantName: string
  applicantAvatar: string
  jobTitle: string
  onClose: () => void
  style?: React.CSSProperties
}

export default function EmployerJobChatAlwaysOpen({ jobId, applicantId, applicantName, applicantAvatar, jobTitle, onClose, style }: EmployerJobChatProps) {
  const { user } = useAuthStore()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Setup WebSocket for real-time chat with applicant
  const { send } = useChatSocket({
    recipientId: applicantId ?? null,
    token: user?.token || null,
    onMessage: (incomingMsg: any) => {
      // Only add message if it belongs to this chat (by sender/recipient and jobId)
      if (
        (
          (incomingMsg.sender_id === applicantId && incomingMsg.recipient_id === user?.id) ||
          (incomingMsg.sender_id === user?.id && incomingMsg.recipient_id === applicantId)
        ) &&
        (!incomingMsg.job_id || incomingMsg.job_id === jobId)
      ) {
        const formattedMessage: Message = {
          id: incomingMsg.id,
          sender_id: incomingMsg.sender_id,
          text: incomingMsg.text,
          timestamp: new Date(incomingMsg.time),
          read: incomingMsg.read ?? false,
        };
        setMessages((prev) => [...prev, formattedMessage]);
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!applicantId || !user?.token) return
    setLoading(true)
    api.get(`/chat/chat/messages/${applicantId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => {
        setMessages(res.data.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          text: msg.text,
          timestamp: msg.time ? new Date(msg.time) : new Date(),
          read: msg.read ?? false,
        })))
        setInitialized(res.data.length > 0)
        setLoading(false)
      })
  }, [applicantId, user?.token])

  useEffect(() => {
    if (
      !initialized &&
      user?.id &&
      !loading &&
      messages.length === 0
    ) {
      setInitialized(true)
    }
  }, [initialized, user?.id, jobId, jobTitle, send, messages.length, loading])

  const handleSendMessage = useCallback(() => {
    if (message.trim() === "") return;
    send({ text: message, job_id: jobId });
    setMessage(""); // Only clear input, do not add to messages here
  }, [message, jobId, send])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      style={style}
      className={cn(
        "fixed bottom-6 z-50 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out h-[500px] max-h-[80vh]"
      )}
    >
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-light-gray rounded-full overflow-hidden mr-2 border border-gray-200">
            <Image
              src={applicantAvatar || "/placeholder-user.jpg"}
              alt={applicantName}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-medium text-dark-gray">{applicantName}</div>
            <div className="text-xs text-gray-500 truncate max-w-[180px]">{jobTitle}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="animate-pulse text-accent text-base font-medium">Loading chats...</span>
            <svg className="animate-spin ml-2 h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.sender_id === user?.id ? "justify-end" : "justify-start")}> 
              {msg.sender_id !== user?.id && (
                <div className="w-8 h-8 bg-light-gray rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200">
                  <Image
                    src={applicantAvatar || "/placeholder-user.jpg"}
                    alt={applicantName}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  msg.sender_id === user?.id ? "bg-accent text-white ml-auto" : "bg-light-gray text-dark-gray mr-auto"
                )}
              >
                <div className="text-sm">{msg.text}</div>
                <div className={cn("text-xs mt-1", msg.sender_id === user?.id ? "text-white/70" : "text-gray-500")}> 
                  {msg.timestamp ? formatChatTime(msg.timestamp) : ""}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={message.trim() === ""}
            className="h-8 w-8 p-0 bg-accent hover:bg-accent/90 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">Your messages are private and secure</div>
      </div>
    </div>
  )
}
