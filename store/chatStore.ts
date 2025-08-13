import { create } from 'zustand'
import api from '@/lib/axios'

interface ChatThreadState {
  // map of partner user id -> unread message count
  unreadByThread: Record<string, number>
  // derived total threads with at least one unread
  unreadThreadCount: number
  setInitial: (record: Record<string, number>) => void
  incrementUnread: (partnerId: string) => void
  clearThread: (partnerId: string) => void
  refreshFromServer: (token: string) => Promise<void>
}

export const useChatStore = create<ChatThreadState>((set, get) => ({
  unreadByThread: {},
  unreadThreadCount: 0,
  setInitial: (record) => set(() => ({
    unreadByThread: record,
    unreadThreadCount: Object.values(record).filter(c => c > 0).length
  })),
  incrementUnread: (partnerId) => set(state => {
    const current = state.unreadByThread[partnerId] || 0
    const updated = { ...state.unreadByThread, [partnerId]: current + 1 }
    const unreadThreadCount = Object.values(updated).filter(c => c > 0).length
    return { unreadByThread: updated, unreadThreadCount }
  }),
  clearThread: (partnerId) => set(state => {
    if(!(partnerId in state.unreadByThread) || state.unreadByThread[partnerId] === 0) return {}
    const updated = { ...state.unreadByThread, [partnerId]: 0 }
    const unreadThreadCount = Object.values(updated).filter(c => c > 0).length
    return { unreadByThread: updated, unreadThreadCount }
  }),
  refreshFromServer: async (token: string) => {
    try {
      const res = await api.get('/chat/chat/recipients', { headers: { Authorization: `Bearer ${token}` } })
      const map: Record<string, number> = {}
      for(const r of res.data || []){
        map[r.id] = r.unreadCount || 0
      }
      get().setInitial(map)
    } catch(e){ /* silent */ }
  }
}))
