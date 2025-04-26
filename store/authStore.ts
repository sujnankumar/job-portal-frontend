import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "applicant" | "employer" | null

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  token?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hydrated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
)
