import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../constants'
import type { Movie, MovieSummary } from '../types'
import { movieCache } from '../utils'

// Quick check for valid poster URLs
const isPosterUrlLikelyValid = (url?: string): boolean => {
  if (!url) return false
  if (url.includes('placeholder')) return false
  if (url.includes('no-image')) return false
  if (url.includes('default')) return false
  return url.startsWith('http') && (url.includes('.jpg') || url.includes('.png') || url.includes('.webp'))
}

// Cache for validated poster URLs
const posterValidationCache = new Map<string, boolean>()

// Validate poster image with timeout for faster loading
const validatePosterImage = (url: string, timeoutMs = 2000): Promise<boolean> => {
  if (posterValidationCache.has(url)) {
    return Promise.resolve(posterValidationCache.get(url)!)
  }
  
  return new Promise((resolve) => {
    const img = new Image()
    const timeout = setTimeout(() => {
      // Timeout - assume valid (will show placeholder if fails later)
      posterValidationCache.set(url, true)
      resolve(true)
    }, timeoutMs)
    
    img.onload = () => {
      clearTimeout(timeout)
      posterValidationCache.set(url, true)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timeout)
      posterValidationCache.set(url, false)
      resolve(false)
    }
    img.src = url
  })
}

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
  
  // Track if initial fetch has happened
  const hasFetched = useRef(false)
  // Track previous values for change detection
  const prevGenre = useRef(selectedGenre)
  const prevSearch = useRef(searchQuery)

  // Fetch auth token - memoized
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
      
      const data = await res.json()
      
      setTotalPages(data.totalPages || data.pages || 1)
      // Handle different possible field names for total count
      const totalCount = data.total || data.totalResults || data.totalCount || data.count || (data.data?.length * (data.totalPages || 1)) || 0
      setTotalResults(totalCount)
      setCurrentPage(page)
      setImageErrors(new Set())
      
      const movieSummaries: Movie[] = (data.data || []).map((m: MovieSummary) => ({
        id: m.id,
        title: m.title
      }))
      
      const movieIds = movieSummaries.map(m => m.id)
      
      // For landing page, keep loading until we have all details
      if (!isLandingPage) {
        setMovies(movieSummaries)
        setLoading(false)
        setLoadingDetails(new Set(movieIds))
      }
      
      const batchSize = 5
      const allMoviesWithDetails: Movie[] = [...movieSummaries]
      
      for (let i = 0; i < movieIds.length; i += batchSize) {
        const batch = movieIds.slice(i, i + batchSize)
        const details = await Promise.all(
          batch.map(id => fetchMovieDetails(authToken, id))
        )
        
        // Update the allMoviesWithDetails array
        batch.forEach((id, idx) => {
          const detail = details[idx]
          if (detail) {
            const movieIndex = allMoviesWithDetails.findIndex(m => m.id === id)
            if (movieIndex !== -1) {
              allMoviesWithDetails[movieIndex] = detail
            }
          }
        })
        
        // For non-landing pages, update progressively
        if (!isLandingPage) {
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
      }
      
      // For landing page, validate posters actually load and filter
      if (isLandingPage) {
        // First quick filter for valid-looking URLs
        const candidates = allMoviesWithDetails.filter(m => 
          m.posterUrl && isPosterUrlLikelyValid(m.posterUrl)
        )
        
        // Validate ALL posters in parallel with timeout for speed
        const validations = await Promise.all(
          candidates.map(async (movie) => ({
            movie,
            valid: await validatePosterImage(movie.posterUrl!, 1500) // 1.5s timeout
          }))
        )
        
        // Filter to valid posters and take first 15
        const validatedMovies = validations
          .filter(v => v.valid)
          .map(v => v.movie)
          .slice(0, 15)
        
        setMovies(validatedMovies)
        setLoading(false)
        setLoadingDetails(new Set())
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

  // Initial fetch - runs once
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    
    fetchToken().then(t => {
      if (t) fetchMovies(t, 1, '', '')
    })
  }, [fetchToken, fetchMovies])

  // Search/genre effect - debounced
  useEffect(() => {
    if (!token || !hasFetched.current) return
    
    // Check if search or genre actually changed
    const genreChanged = prevGenre.current !== selectedGenre
    const searchChanged = prevSearch.current !== searchQuery
    
    // Update refs
    prevGenre.current = selectedGenre
    prevSearch.current = searchQuery
    
    // Only fetch if something changed
    if (!genreChanged && !searchChanged) return
    
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
