import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService, favoritesService, type User, type Favorite } from '../lib/appwrite'

interface AuthContextType {
  user: User | null
  loading: boolean
  cloudFavorites: Favorite[]
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  addToCloudFavorites: (movieId: string, title: string, poster?: string, rating?: number) => Promise<void>
  removeFromCloudFavorites: (movieId: string) => Promise<void>
  isMovieInCloudFavorites: (movieId: string) => boolean
  refreshFavorites: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cloudFavorites, setCloudFavorites] = useState<Favorite[]>([])

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Fetch favorites when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setCloudFavorites([])
    }
  }, [user])

  // Check for magic link or password reset in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get('userId')
    const secret = urlParams.get('secret')

    if (userId && secret) {
      // Handle magic link verification
      authService.verifyMagicLink(userId, secret)
        .then(() => {
          checkSession()
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch(console.error)
    }
  }, [])

  const checkSession = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return
    const favorites = await favoritesService.getFavorites(user.$id)
    setCloudFavorites(favorites)
  }

  const login = async (email: string, password: string) => {
    await authService.login(email, password)
    await checkSession()
  }

  const signup = async (email: string, password: string, name: string) => {
    await authService.createAccount(email, password, name)
    await checkSession()
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setCloudFavorites([])
  }

  const sendMagicLink = async (email: string) => {
    await authService.sendMagicLink(email)
  }

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email)
  }

  const addToCloudFavorites = useCallback(async (
    movieId: string,
    title: string,
    poster?: string,
    rating?: number
  ) => {
    if (!user) return
    const favorite = await favoritesService.addFavorite(user.$id, movieId, title, poster, rating)
    if (favorite) {
      setCloudFavorites(prev => [favorite, ...prev])
    }
  }, [user])

  const removeFromCloudFavorites = useCallback(async (movieId: string) => {
    if (!user) return
    const favorite = cloudFavorites.find(f => f.movieId === movieId)
    if (favorite) {
      const success = await favoritesService.removeFavorite(favorite.$id)
      if (success) {
        setCloudFavorites(prev => prev.filter(f => f.$id !== favorite.$id))
      }
    }
  }, [user, cloudFavorites])

  const isMovieInCloudFavorites = useCallback((movieId: string): boolean => {
    return cloudFavorites.some(f => f.movieId === movieId)
  }, [cloudFavorites])

  const refreshFavorites = async () => {
    await fetchFavorites()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      cloudFavorites,
      login,
      signup,
      logout,
      sendMagicLink,
      forgotPassword,
      addToCloudFavorites,
      removeFromCloudFavorites,
      isMovieInCloudFavorites,
      refreshFavorites
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
