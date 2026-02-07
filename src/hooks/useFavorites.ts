import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Movie } from '../types'

export function useFavorites(movies: Movie[]) {
  const { 
    user, 
    loading: authLoading, 
    cloudFavorites, 
    localFavorites,
    addToCloudFavorites, 
    removeFromCloudFavorites, 
    isMovieInCloudFavorites,
    addToLocalFavorites,
    removeFromLocalFavorites,
    syncLocalToCloud,
    logout 
  } = useAuth()

  const [guestPromptOpen, setGuestPromptOpen] = useState(false)
  const [pendingFavoriteAction, setPendingFavoriteAction] = useState<{ movieId: string; movie?: Movie } | null>(null)

  // Computed favorites list
  const favorites = useMemo(() => 
    user ? cloudFavorites.map(f => f.movieId) : localFavorites,
    [user, cloudFavorites, localFavorites]
  )

  // Sync local favorites to cloud when user logs in
  useEffect(() => {
    if (user && localFavorites.length > 0 && movies.length > 0) {
      const movieData = new Map<string, { title: string; poster?: string; rating?: number }>()
      movies.forEach(m => {
        movieData.set(m.id, { 
          title: m.title, 
          poster: m.posterUrl, 
          rating: m.rating ? parseFloat(m.rating) : undefined 
        })
      })
      syncLocalToCloud(movieData)
    }
  }, [user, localFavorites.length, movies, syncLocalToCloud])

  // Toggle favorite
  const toggleFavorite = useCallback((movieId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    const movie = movies.find(m => m.id === movieId)
    const isCurrentlyFavorite = user ? isMovieInCloudFavorites(movieId) : localFavorites.includes(movieId)
    
    if (isCurrentlyFavorite) {
      if (user) {
        removeFromCloudFavorites(movieId)
      } else {
        removeFromLocalFavorites(movieId)
      }
      return
    }
    
    if (user) {
      if (movie) {
        addToCloudFavorites(movieId, movie.title, movie.posterUrl, movie.rating ? parseFloat(movie.rating) : undefined)
      }
    } else {
      setPendingFavoriteAction({ movieId, movie })
      setGuestPromptOpen(true)
    }
  }, [user, movies, localFavorites, isMovieInCloudFavorites, addToCloudFavorites, removeFromCloudFavorites, removeFromLocalFavorites])

  // Execute add favorite (for guest continuing)
  const executeAddFavorite = useCallback((movieId: string) => {
    addToLocalFavorites(movieId)
  }, [addToLocalFavorites])

  // Close guest prompt
  const closeGuestPrompt = useCallback(() => {
    setGuestPromptOpen(false)
    setPendingFavoriteAction(null)
  }, [])

  // Handle continue as guest
  const handleContinueAsGuest = useCallback(() => {
    if (pendingFavoriteAction) {
      executeAddFavorite(pendingFavoriteAction.movieId)
    }
    setPendingFavoriteAction(null)
  }, [pendingFavoriteAction, executeAddFavorite])

  return {
    user,
    authLoading,
    cloudFavorites,
    favorites,
    toggleFavorite,
    logout,
    guestPromptOpen,
    closeGuestPrompt,
    handleContinueAsGuest
  }
}
