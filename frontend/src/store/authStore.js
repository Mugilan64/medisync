import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      updateUser: (userData) => set({ user: userData }),
      getRole: () => get().user?.role?.name || null,
    }),
    {
      name: 'medisync-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Convenience hook that adds computed role booleans
export function useAuth() {
  const store = useAuthStore()
  const role = store.user?.role?.name
  return {
    ...store,
    isAdmin: role === 'super_admin',
    isDoctor: role === 'doctor',
    isPatient: role === 'patient',
  }
}

export default useAuthStore
