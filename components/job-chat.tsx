"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Send, X, Paperclip, ChevronDown, ChevronUp, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "employer"
  text: string
  timestamp: Date
  read: boolean
}

interface JobChatProps {
  jobId: string
  companyName: string
  companyLogo: string
  jobTitle: string
}

export default function JobChat({ jobId, companyName, companyLogo, jobTitle }: JobChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "employer",
      text: `Hello! Thanks for your interest in the ${jobTitle} position. How can I help you today?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: true,
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isMinimized])

  const handleSendMessage = () => {
    if (message.trim() === "") return

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      timestamp: new Date(),
      read: true,
    }
    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // Simulate employer response after a delay
    setTimeout(
      () => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "employer",
          text: getRandomResponse(),
          timestamp: new Date(),
          read: false,
        }
        setMessages((prev) => [...prev, responseMessage])
      },
      1000 * (Math.floor(Math.random() * 3) + 1),
    ) // Random delay between 1-3 seconds
  }

  const getRandomResponse = () => {
    const responses = [
      `Thank you for your message! We typically review applications within 1-2 weeks and will contact qualified candidates for interviews.`,
      `That's a great question about the ${jobTitle} role. The position requires 3-5 years of experience and strong communication skills.`,
      `Yes, this is a full-time remote position with occasional visits to our headquarters for team meetings.`,
      `The salary range for this position is competitive and based on experience. We also offer comprehensive benefits including health insurance and 401(k) matching.`,
      `The team you'd be joining consists of 8 people, with a mix of senior and junior professionals.`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-accent hover:bg-accent/90 shadow-lg z-50"
      >
        Chat with Employer
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
        isMinimized ? "h-14" : "h-[500px] max-h-[80vh]",
      )}
    >
      {/* Chat Header */}
      <div
        className="p-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-light-gray rounded-full overflow-hidden mr-2 border border-gray-200">
            <Image
              src={companyLogo || "/placeholder.svg"}
              alt={companyName}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <div className="font-medium text-dark-gray">{companyName}</div>
            <div className="text-xs text-gray-500 truncate max-w-[180px]">{jobTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(true)
              }}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          )}
          {isMinimized ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                {msg.sender === "employer" && (
                  <div className="w-8 h-8 bg-light-gray rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-200">
                    <Image
                      src={companyLogo || "/placeholder.svg"}
                      alt={companyName}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    msg.sender === "user" ? "bg-accent text-white" : "bg-light-gray text-dark-gray",
                  )}
                >
                  <div className="text-sm">{msg.text}</div>
                  <div className={cn("text-xs mt-1", msg.sender === "user" ? "text-white/70" : "text-gray-500")}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.sender === "user" && <span className="ml-1">{msg.read ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </div>
            ))}
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
        </>
      )}
    </div>
  )
}
