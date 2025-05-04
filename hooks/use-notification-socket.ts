import { useEffect, useRef } from "react"

export function useNotificationSocket({
  token,
  onNotification,
  onOpen,
  onClose,
}: {
  token: string | null
  onNotification: (msg: any) => void
  onOpen?: () => void
  onClose?: () => void
}) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!token) return
    const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND || "ws://localhost:8000/api/notifications"
    const ws = new WebSocket(`${WS_BACKEND}/ws?token=${token}`)
    wsRef.current = ws
    ws.onopen = () => {
      if (onOpen) onOpen()
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onNotification(data)
      } catch {}
    }
    ws.onclose = () => {
      if (onClose) onClose()
    }
    return () => {
      ws.close()
    }
  }, [token])

  return {}
}
