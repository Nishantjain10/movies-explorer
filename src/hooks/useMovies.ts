import { useState, useCallback, useMemo, useEffect } from 'react'
import { API_BASE_URL } from '../constants'
import type { Movie, MovieSummary, MoviesResponse } from '../types'
import { movieCache } from '../utils'

export function useMovies() {
  const [token, setToken] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Fetch auth token
  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/token`)
      const data = await res.json()
      setToken(data.token)
      return data.token
    } catch {
      setError('Connection failed')
      return null
    }
  }, [])

  // Fetch single movie details
  const fetchMovieDetails = useCallback(async (authToken: string, movieId: string): Promise<Movie | null> => {
    if (movieCache.has(movieId)) {
      return movieCache.get(movieId)!
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) return null
      
      const movie: Movie = await res.json()
      movieCache.set(movieId, movie)
      return movie
    } catch {
      return null
    }
  }, [])

  // Fetch movies list and their details
  const fetchMovies = useCallback(async (authToken: string, page = 1, search = '', genre = '') => {
    setLoading(true)
    setError(null)
    try {
      // For page 1 with no filters, fetch extra movies to ensure we have enough with posters
      const isLandingPage = page === 1 && !search && !genre
      const fetchLimit = isLandingPage ? 30 : 15
      
      const params = new URLSearchParams({ page: String(page), limit: String(fetchLimit) })
      if (search) params.append('search', search)
      if (genre) params.append('genre', genre)
      
      const res = await fetch(`${API_BASE_URL}/movies?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error()
      
      const data: MoviesResponse = await res.json()
      
      setTotalPages(data.totalPages || 1)
      setTotalResults(data.total || 0)
      setCurrentPage(page)
      setImageErrors(new Set())
      
      const movieSummaries: Movie[] = (data.data || []).map((m: MovieSummary) => ({
        id: m.id,
        title: m.title
      }))
      setMovies(movieSummaries)
      setLoading(false)
      
      const movieIds = movieSummaries.map(m => m.id)
      setLoadingDetails(new Set(movieIds))
      
      const batchSize = 5
      
      for (let i = 0; i < movieIds.length; i += batchSize) {
        const batch = movieIds.slice(i, i + batchSize)
        const details = await Promise.all(
          batch.map(id => fetchMovieDetails(authToken, id))
        )
        
        setMovies(prev => prev.map(movie => {
          const detail = details.find(d => d?.id === movie.id)
          return detail || movie
        }))
        
        setLoadingDetails(prev => {
          const next = new Set(prev)
          batch.forEach(id => next.delete(id))
          return next
        })
      }
      
      // For landing page, filter to only show movies with posters (up to 15)
      if (isLandingPage) {
        setMovies(prev => {
          const withPoster = prev.filter(m => m.posterUrl)
          // Return only movies with posters, max 15
          return withPoster.slice(0, 15)
        })
      }
      
    } catch {
      setError('Failed to load movies')
      setLoading(false)
    }
  }, [fetchMovieDetails])

  // Handle image error
  const handleImageError = useCallback((movieId: string) => {
    setImageErrors(prev => new Set(prev).add(movieId))
  }, [])

  // Handle genre change
  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(prev => prev === genre ? '' : genre)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (token && page >= 1 && page <= totalPages) {
      fetchMovies(token, page, searchQuery, selectedGenre)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [token, totalPages, searchQuery, selectedGenre, fetchMovies])

  // Memoized page numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, totalPages])

  // Initial fetch
  useEffect(() => {
    fetchToken().then(t => {
      if (t) fetchMovies(t, 1, '', '')
    })
  }, [fetchToken, fetchMovies])

  // Search/genre effect
  useEffect(() => {
    if (!token) return
    const timeoutId = setTimeout(() => {
      fetchMovies(token, 1, searchQuery, selectedGenre)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedGenre, token, fetchMovies])

  return {
    token,
    movies,
    loading,
    loadingDetails,
    error,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre: handleGenreChange,
    currentPage,
    totalPages,
    totalResults,
    imageErrors,
    handleImageError,
    handlePageChange,
    pageNumbers,
    fetchMovies,
    refetch: () => token && fetchMovies(token, 1, searchQuery, selectedGenre)
  }
}
