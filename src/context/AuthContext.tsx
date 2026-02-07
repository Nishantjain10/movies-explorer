import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { authService, favoritesService, type User, type Favorite } from '../lib/appwrite'

// Local storage keys
const LOCAL_FAVORITES_KEY = 'movieFavorites'

// Get local favorites
const getLocalFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

// Save local favorites
const saveLocalFavorites = (ids: string[]) => {
  localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(ids))
}

interface AuthContextType {
  user: User | null
  loading: boolean
  cloudFavorites: Favorite[]
  localFavorites: string[]
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  addToCloudFavorites: (movieId: string, title: string, poster?: string, rating?: number) => Promise<void>
  removeFromCloudFavorites: (movieId: string) => Promise<void>
  isMovieInCloudFavorites: (movieId: string) => boolean
  addToLocalFavorites: (movieId: string) => void
  removeFromLocalFavorites: (movieId: string) => void
  isInFavorites: (movieId: string) => boolean
  syncLocalToCloud: (movieData: Map<string, { title: string; poster?: string; rating?: number }>) => Promise<void>
  refreshFavorites: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [cloudFavorites, setCloudFavorites] = useState<Favorite[]>([])
  const [localFavorites, setLocalFavorites] = useState<string[]>(getLocalFavorites)

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
        .catch(() => {
          // Silently handle magic link errors
        })
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
    try {
      const favorites = await favoritesService.getFavorites(user.$id)
      setCloudFavorites(favorites)
    } catch {
      // Silently handle fetch errors
      setCloudFavorites([])
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password)
    await checkSession()
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    await authService.createAccount(email, password, name)
    await checkSession()
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setCloudFavorites([])
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    await authService.sendMagicLink(email)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email)
  }, [])

  const addToCloudFavorites = useCallback(async (
    movieId: string,
    title: string,
    poster?: string,
    rating?: number
  ) => {
    if (!user) return
    try {
      const favorite = await favoritesService.addFavorite(user.$id, movieId, title, poster, rating)
      if (favorite) {
        setCloudFavorites(prev => [favorite, ...prev])
      }
    } catch {
      // Silently handle add errors
    }
  }, [user])

  const removeFromCloudFavorites = useCallback(async (movieId: string) => {
    if (!user) return
    const favorite = cloudFavorites.find(f => f.movieId === movieId)
    if (favorite) {
      try {
        const success = await favoritesService.removeFavorite(favorite.$id)
        if (success) {
          setCloudFavorites(prev => prev.filter(f => f.$id !== favorite.$id))
        }
      } catch {
        // Silently handle remove errors
      }
    }
  }, [user, cloudFavorites])

  const isMovieInCloudFavorites = useCallback((movieId: string): boolean => {
    return cloudFavorites.some(f => f.movieId === movieId)
  }, [cloudFavorites])

  // Local favorites management
  const addToLocalFavorites = useCallback((movieId: string) => {
    setLocalFavorites(prev => {
      if (prev.includes(movieId)) return prev
      const newFavs = [...prev, movieId]
      saveLocalFavorites(newFavs)
      return newFavs
    })
  }, [])

  const removeFromLocalFavorites = useCallback((movieId: string) => {
    setLocalFavorites(prev => {
      const newFavs = prev.filter(id => id !== movieId)
      saveLocalFavorites(newFavs)
      return newFavs
    })
  }, [])

  // Check if movie is in favorites (cloud if logged in, local otherwise)
  const isInFavorites = useCallback((movieId: string): boolean => {
    if (user) {
      return isMovieInCloudFavorites(movieId)
    }
    return localFavorites.includes(movieId)
  }, [user, localFavorites, isMovieInCloudFavorites])

  // Sync local favorites to cloud when user logs in
  const syncLocalToCloud = useCallback(async (
    movieData: Map<string, { title: string; poster?: string; rating?: number }>
  ) => {
    if (!user) {
      return
    }
    
    // Always clear local favorites first - they either get synced or are already in cloud
    const localToSync = [...localFavorites]
    setLocalFavorites([])
    saveLocalFavorites([])
    
    if (localToSync.length === 0) return
    
    // Get IDs that are in local but not in cloud
    const cloudIds = new Set(cloudFavorites.map(f => f.movieId))
    const toSync = localToSync.filter(id => !cloudIds.has(id))
    
    // Sync each to cloud
    for (const movieId of toSync) {
      const data = movieData.get(movieId)
      if (data) {
        await addToCloudFavorites(movieId, data.title, data.poster, data.rating)
      }
    }
  }, [user, localFavorites, cloudFavorites, addToCloudFavorites])

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites()
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    cloudFavorites,
    localFavorites,
    login,
    signup,
    logout,
    sendMagicLink,
    forgotPassword,
    addToCloudFavorites,
    removeFromCloudFavorites,
    isMovieInCloudFavorites,
    addToLocalFavorites,
    removeFromLocalFavorites,
    isInFavorites,
    syncLocalToCloud,
    refreshFavorites
  }), [
    user,
    loading,
    cloudFavorites,
    localFavorites,
    login,
    signup,
    logout,
    sendMagicLink,
    forgotPassword,
    addToCloudFavorites,
    removeFromCloudFavorites,
    isMovieInCloudFavorites,
    addToLocalFavorites,
    removeFromLocalFavorites,
    isInFavorites,
    syncLocalToCloud,
    refreshFavorites
  ])

  return (
    <AuthContext.Provider value={contextValue}>
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
