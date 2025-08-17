import { useEffect, useRef } from "react"

export function useChatSocket({
  recipientId,
  token,
  onMessage,
  onOpen,
  onClose,
}: {
  recipientId: string | null
  token: string | null
  onMessage: (msg: any) => void
  onOpen?: () => void
  onClose?: () => void
}) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!recipientId || !token) return
    // const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND || "ws://localhost:8000/api/chat"
    const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND || "wss://alluring-bravery-production.up.railway.app/api/chat"
    // const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND || "wss://job-portal-backend-x5oc.onrender.com/api/chat"
    const ws = new WebSocket(
      `${WS_BACKEND}/ws/chat/${recipientId}?token=${token}`
    )
    wsRef.current = ws
    ws.onopen = () => {
      if (onOpen) onOpen()
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch {}
    }
    ws.onclose = () => {
      if (onClose) onClose()
    }
    return () => {
      ws.close()
    }
  }, [recipientId, token])

  const send = (msg: any) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }

  return { send }
}
