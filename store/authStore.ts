import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "applicant" | "employer" | null

export type FormValidationStatus = {
  [key: string]: boolean
}

export type OnboardingStatus = {
  isComplete: boolean
  lastStep?: number
  startedAt?: string
  lastUpdated?: string
  formData?: any
  validationStatus?: FormValidationStatus
  validationMessages?: { [key: string]: string }
}

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  jobPosition?: string
  companyId?: string
  companyName?: string
  onboarding: OnboardingStatus
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hydrated: boolean // <-- add hydrated state
  login: (user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  updateOnboardingStatus: (status: Partial<OnboardingStatus>) => void
  updateOnboardingData: (formData: any) => void
  updateValidationStatus: (field: string, isValid: boolean, message?: string) => void
  completeOnboarding: () => void
  setHydrated: (hydrated: boolean) => void // <-- add setter
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false, // <-- initial value
      login: (user) =>
        set({
          user: {
            ...user,
            onboarding: user.onboarding || {
              isComplete: false,
              startedAt: new Date().toISOString(),
              formData: {},
              validationStatus: {},
              validationMessages: {},
            },
          },
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      updateOnboardingStatus: (status) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                onboarding: {
                  ...state.user.onboarding,
                  ...status,
                  lastUpdated: new Date().toISOString(),
                },
              }
            : null,
        })),
      updateOnboardingData: (formData) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                onboarding: {
                  ...state.user.onboarding,
                  formData: {
                    ...(state.user.onboarding.formData || {}),
                    ...formData,
                  },
                  lastUpdated: new Date().toISOString(),
                },
              }
            : null,
        })),
      updateValidationStatus: (field, isValid, message) =>
        set((state) => {
          if (!state.user) return { user: null }

          const validationStatus = {
            ...(state.user.onboarding.validationStatus || {}),
            [field]: isValid,
          }

          const validationMessages = {
            ...(state.user.onboarding.validationMessages || {}),
          }

          if (message) {
            validationMessages[field] = message
          } else if (!isValid) {
            validationMessages[field] = `Please complete the ${field} section`
          } else {
            delete validationMessages[field]
          }

          return {
            user: {
              ...state.user,
              onboarding: {
                ...state.user.onboarding,
                validationStatus,
                validationMessages,
                lastUpdated: new Date().toISOString(),
              },
            },
          }
        }),
      completeOnboarding: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                onboarding: {
                  ...state.user.onboarding,
                  isComplete: true,
                  lastUpdated: new Date().toISOString(),
                },
              }
            : null,
        })),
      setHydrated: (hydrated) => set({ hydrated }), // <-- setter
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
