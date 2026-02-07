import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthModal } from './components/AuthModal'

// API
const API_BASE_URL = 'https://0kadddxyh3.execute-api.us-east-1.amazonaws.com'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Types
interface MovieSummary {
  id: string
  title: string
}

interface Genre {
  id?: string
  name?: string
  title?: string
}

interface Movie {
  id: string
  title: string
  posterUrl?: string
  rating?: string
  overview?: string
  genres?: (string | Genre)[]
  genre?: string
  runtime?: number
  duration?: number
  year?: number
  releaseDate?: string
}

interface MoviesResponse {
  data: MovieSummary[]
  totalPages: number
  page: number
  total: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Constants
const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'] as const

// Local storage helpers
const getFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('movieFavorites') || '[]')
  } catch {
    return []
  }
}

const saveFavorites = (ids: string[]) => {
  localStorage.setItem('movieFavorites', JSON.stringify(ids))
}

// Cache for movie details
const movieCache = new Map<string, Movie>()

// Generate YouTube trailer search URL
const getTrailerUrl = (title: string, year?: number) => {
  const query = encodeURIComponent(`${title} ${year || ''} official trailer`)
  return `https://www.youtube.com/results?search_query=${query}`
}

// Extract year from movie data
const getMovieYear = (movie: Movie): number => {
  if (movie.year && typeof movie.year === 'number') return movie.year
  if (movie.releaseDate) {
    const parsed = parseInt(String(movie.releaseDate).substring(0, 4))
    if (!isNaN(parsed) && parsed > 1800 && parsed < 2100) return parsed
  }
  return 0
}

// Memoized Placeholder component
const MoviePlaceholder = memo(({ title, size = 'card' }: { title: string; size?: 'card' | 'modal' }) => {
  const colors = [
    ['from-rose-900', 'to-pink-950'],
    ['from-violet-900', 'to-purple-950'],
    ['from-blue-900', 'to-indigo-950'],
    ['from-emerald-900', 'to-teal-950'],
    ['from-amber-900', 'to-orange-950'],
    ['from-cyan-900', 'to-sky-950'],
  ]
  const colorIndex = title.length % colors.length
  const [from, to] = colors[colorIndex]
  
  return (
    <div className={`w-full h-full bg-linear-to-br ${from} ${to} flex flex-col items-center justify-center ${size === 'modal' ? 'p-8' : 'p-4'}`}>
      <div className={`${size === 'modal' ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/10 flex items-center justify-center mb-3`}>
        <svg className={`${size === 'modal' ? 'w-10 h-10' : 'w-6 h-6'} text-white/40`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
        </svg>
      </div>
      <span className={`${size === 'modal' ? 'text-base' : 'text-[11px]'} text-white/60 text-center line-clamp-2 font-medium px-2`}>
        {title}
      </span>
    </div>
  )
})

MoviePlaceholder.displayName = 'MoviePlaceholder'

// Memoized Movie Card component
interface MovieCardProps {
  movie: Movie
  isFavorite: boolean
  hasError: boolean
  isLoading: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onImageError: () => void
}

const MovieCard = memo(({ movie, isFavorite, hasError, isLoading, onSelect, onToggleFavorite, onImageError }: MovieCardProps) => {
  const movieYear = getMovieYear(movie)
  const hasValidPoster = movie.posterUrl && !hasError

  return (
    <div onClick={onSelect} className="group cursor-pointer">
      <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 transition-all duration-200 group-hover:ring-2 group-hover:ring-red-500/50 group-hover:scale-[1.02]">
        {isLoading ? (
          <div className="w-full h-full bg-zinc-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : hasValidPoster ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={onImageError}
          />
        ) : (
          <MoviePlaceholder title={movie.title} size="card" />
        )}
        
        {movie.rating && !isLoading && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-semibold border border-white/20">
            {movie.rating}
          </span>
        )}

        <button
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/70'
          }`}
        >
          <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {!isLoading && movie.overview && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-zinc-300 line-clamp-3">{movie.overview}</p>
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-medium text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
        {movie.title}
      </h3>
      {movieYear > 0 && <p className="text-xs text-zinc-600">{movieYear}</p>}
    </div>
  )
})

MovieCard.displayName = 'MovieCard'

// Loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="aspect-2/3 rounded-xl bg-zinc-800/50 animate-pulse" />
        <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = 'LoadingSkeleton'

function App() {
  // Auth
  const { user, loading: authLoading, cloudFavorites, addToCloudFavorites, removeFromCloudFavorites, isMovieInCloudFavorites, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  // State
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
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [localFavorites, setLocalFavorites] = useState<string[]>(getFavorites)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Computed: Use cloud favorites when logged in, local otherwise
  const favorites = useMemo(() => 
    user ? cloudFavorites.map(f => f.movieId) : localFavorites,
    [user, cloudFavorites, localFavorites]
  )
  
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your movie recommendation assistant. Tell me what kind of movie you're in the mood for, and I'll suggest something great! You can describe a genre, mood, or even a specific type of story." }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Refs
  const genreScrollRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Memoized: Display movies (favorites filter)
  const displayMovies = useMemo(() => 
    showFavoritesOnly 
      ? movies.filter(m => favorites.includes(m.id))
      : movies,
    [showFavoritesOnly, movies, favorites]
  )

  // Memoized: Page numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, totalPages])

  // Callbacks
  const toggleFavorite = useCallback((movieId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    // If logged in, use cloud favorites
    if (user) {
      if (isMovieInCloudFavorites(movieId)) {
        removeFromCloudFavorites(movieId)
      } else {
        const movie = movies.find(m => m.id === movieId)
        if (movie) {
          addToCloudFavorites(movieId, movie.title, movie.posterUrl, movie.rating ? parseFloat(movie.rating) : undefined)
        }
      }
    } else {
      // Guest mode: use local storage
      setLocalFavorites(prev => {
        const newFavs = prev.includes(movieId) 
          ? prev.filter(id => id !== movieId)
          : [...prev, movieId]
        saveFavorites(newFavs)
        return newFavs
      })
    }
  }, [user, movies, isMovieInCloudFavorites, addToCloudFavorites, removeFromCloudFavorites])

  const watchTrailer = useCallback((movie: Movie) => {
    const url = getTrailerUrl(movie.title, getMovieYear(movie))
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const scrollGenres = useCallback((direction: 'left' | 'right') => {
    genreScrollRef.current?.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth'
    })
  }, [])

  const handleImageError = useCallback((movieId: string) => {
    setImageErrors(prev => new Set(prev).add(movieId))
  }, [])

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
      const params = new URLSearchParams({ page: String(page), limit: '15' })
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
      
      const movieSummaries: Movie[] = (data.data || []).map(m => ({
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
      
    } catch {
      setError('Failed to load movies')
      setLoading(false)
    }
  }, [fetchMovieDetails])

  // Detect genre from user message
  const detectGenre = (message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    for (const genre of GENRES) {
      if (lowerMessage.includes(genre.toLowerCase())) {
        return genre
      }
    }
    // Common aliases
    const aliases: Record<string, string> = {
      'scary': 'Horror',
      'funny': 'Comedy',
      'romantic': 'Romance',
      'love': 'Romance',
      'sci-fi': 'Science Fiction',
      'scifi': 'Science Fiction',
      'animated': 'Animation',
      'cartoon': 'Animation',
      'kids': 'Family',
      'children': 'Family',
      'suspense': 'Thriller',
      'historical': 'History',
      'war film': 'War',
      'western film': 'Western',
      'musical': 'Music',
      'documentary film': 'Documentary',
      'doc': 'Documentary',
      'criminal': 'Crime',
    }
    for (const [alias, genre] of Object.entries(aliases)) {
      if (lowerMessage.includes(alias)) {
        return genre
      }
    }
    return null
  }

  // Get smart response based on intent
  const getSmartResponse = (message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    
    // Best rated / top rated
    if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('rated') || lowerMessage.includes('popular')) {
      const topMovies = movies.filter(m => m.rating).slice(0, 3)
      if (topMovies.length > 0) {
        const movieList = topMovies.map(m => `"${m.title}"`).join(', ')
        return `Here are some great picks from what's showing: ${movieList}. Click on any movie to see more details and watch the trailer!`
      }
      return "Check out the movies on screen - click any one to see its rating and details!"
    }
    
    // Recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should')) {
      const randomMovies = movies.sort(() => Math.random() - 0.5).slice(0, 3)
      if (randomMovies.length > 0) {
        const movieList = randomMovies.map(m => `"${m.title}"`).join(', ')
        return `I'd suggest checking out: ${movieList}. Or tell me a genre you like and I'll filter the movies for you!`
      }
    }
    
    // Clear filter
    if (lowerMessage.includes('all movies') || lowerMessage.includes('show all') || lowerMessage.includes('clear filter') || lowerMessage.includes('reset')) {
      return null // Will be handled specially
    }
    
    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return `I can help you discover movies! Here's what you can do:\n• Say a genre like "action", "comedy", or "horror"\n• Ask for "recommendations" or "best movies"\n• Say "show all" to clear filters\n• Click any movie to see details!`
    }
    
    return null
  }

  // Chat handler
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Handle clear/reset
    if (lowerMessage.includes('all movies') || lowerMessage.includes('show all') || lowerMessage.includes('clear') || lowerMessage.includes('reset')) {
      setSelectedGenre('')
      setShowFavoritesOnly(false)
      if (token) {
        fetchMovies(token, 1, searchQuery, '')
      }
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Done! I've cleared all filters. You're now seeing all movies. What genre are you in the mood for?" 
      }])
      setChatLoading(false)
      return
    }
    
    // Check if user mentioned a genre
    const detectedGenre = detectGenre(userMessage)
    
    if (detectedGenre) {
      setSelectedGenre(detectedGenre)
      setShowFavoritesOnly(false)
      if (token) {
        fetchMovies(token, 1, searchQuery, detectedGenre)
      }
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Great choice! I've applied the ${detectedGenre} filter for you. Check out the movies now showing! Click on any movie to see details and watch the trailer.` 
      }])
      setChatLoading(false)
      return
    }
    
    // Check for smart responses
    const smartResponse = getSmartResponse(userMessage)
    if (smartResponse) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: smartResponse }])
      setChatLoading(false)
      return
    }
    
    // Try Gemini API for other queries
    try {
      const movieContext = movies.slice(0, 5).map(m => m.title).join(', ')
      
      const prompt = `You are a helpful movie assistant. Available genres: ${GENRES.join(', ')}. 
Currently showing movies include: ${movieContext}.
User says: "${userMessage}"
Give a brief, friendly response (1-2 sentences). If they want movies, suggest they mention a genre.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
        })
      })
      
      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (aiResponse) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      } else {
        throw new Error('No response')
      }
    } catch {
      // Fallback response
      const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']
      const randomGenre = genres[Math.floor(Math.random() * genres.length)]
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Try asking for a genre! For example, say "${randomGenre.toLowerCase()}" and I'll filter the movies for you. Or ask for "recommendations"!` 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleGenre = useCallback((g: string) => {
    setSelectedGenre(prev => prev === g ? '' : g)
    setShowFavoritesOnly(false)
  }, [])

  const handlePage = useCallback((p: number) => {
    if (token && p >= 1 && p <= totalPages) {
      fetchMovies(token, p, searchQuery, selectedGenre)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [token, totalPages, searchQuery, selectedGenre, fetchMovies])

  const formatRuntime = useCallback((m?: number) => 
    m ? `${Math.floor(m/60)}h ${m%60}m` : null, 
  [])

  // Effects
  useEffect(() => {
    fetchToken().then(t => t && fetchMovies(t))
  }, [fetchToken, fetchMovies])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (!token) return
    
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchMovies(token, 1, searchQuery, selectedGenre)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre, token, fetchMovies])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                </svg>
              </div>
              <span className="text-lg font-bold hidden sm:block">Movie<span className="text-red-500">Explorer</span></span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-zinc-500 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Favorites */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  showFavoritesOnly 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${showFavoritesOnly ? 'bg-white/20' : 'bg-white/10'}`}>{favorites.length}</span>
                )}
              </button>

              {/* Auth Button */}
              {!authLoading && (
                user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium border border-white/10 transition-all">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-zinc-300 max-w-[100px] truncate">{user.name || user.email}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <p className="px-2 py-1 text-xs text-zinc-500">{cloudFavorites.length} saved favorites</p>
                        <button
                          onClick={logout}
                          className="w-full mt-1 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 rounded-lg transition"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )
              )}

              {!loading && totalResults > 0 && !showFavoritesOnly && (
                <div className="hidden lg:block text-sm text-zinc-400 pl-2 border-l border-white/10">
                  <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
                </div>
              )}
            </div>
          </div>

          {/* Genre pills */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => scrollGenres('left')}
              className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div ref={genreScrollRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setSelectedGenre(''); setShowFavoritesOnly(false) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  !selectedGenre && !showFavoritesOnly
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                All
              </button>
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => handleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedGenre === g 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollGenres('right')}
              className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {showFavoritesOnly && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">My Favorites</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {favorites.length === 0 
                    ? 'No favorites yet. Click the heart on movies to add them!'
                    : `${displayMovies.length} of ${favorites.length} favorites shown`}
                </p>
              </div>
              {!user && favorites.length > 0 && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-orange-500 rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Sign in to sync
                </button>
              )}
            </div>
            {user && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Synced to cloud
              </p>
            )}
          </div>
        )}

        {!loading && totalResults > 0 && !showFavoritesOnly && (
          <p className="lg:hidden text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
            {selectedGenre && <span> in <span className="text-red-400">{selectedGenre}</span></span>}
          </p>
        )}

        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">{error}</p>
            <button onClick={() => token && fetchMovies(token)} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && displayMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayMovies.map((movie, i) => (
              <MovieCard
                key={movie.id || i}
                movie={movie}
                isFavorite={favorites.includes(movie.id)}
                hasError={imageErrors.has(movie.id)}
                isLoading={loadingDetails.has(movie.id)}
                onSelect={() => setSelectedMovie(movie)}
                onToggleFavorite={(e) => toggleFavorite(movie.id, e)}
                onImageError={() => handleImageError(movie.id)}
              />
            ))}
          </div>
        )}

        {!loading && !error && displayMovies.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-zinc-500">{showFavoritesOnly ? 'No favorites yet' : 'No movies found'}</p>
          </div>
        )}

        {!loading && !showFavoritesOnly && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm border border-white/10 transition"
            >
              ← Prev
            </button>
            
            <div className="flex gap-1">
              {pageNumbers.map(p => (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    currentPage === p 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm border border-white/10 transition"
            >
              Next →
            </button>
          </div>
        )}

        {!showFavoritesOnly && totalPages > 1 && !loading && (
          <p className="text-center text-zinc-600 text-xs mt-3">Page {currentPage} of {totalPages}</p>
        )}
      </main>

      {/* Movie Modal */}
      {selectedMovie && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={() => setSelectedMovie(null)}
        >
          <div 
            className="w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden ring-1 ring-white/10 max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-52 sm:h-60 bg-zinc-800">
              {selectedMovie.posterUrl && !imageErrors.has(selectedMovie.id) ? (
                <img 
                  src={selectedMovie.posterUrl} 
                  alt={selectedMovie.title} 
                  className="w-full h-full object-cover" 
                  onError={() => handleImageError(selectedMovie.id)}
                />
              ) : (
                <MoviePlaceholder title={selectedMovie.title} size="modal" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
              
              <button 
                onClick={() => setSelectedMovie(null)} 
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedMovie.id) }}
                className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full transition ${
                  favorites.includes(selectedMovie.id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <svg className="w-4 h-4" fill={favorites.includes(selectedMovie.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <button
                onClick={() => watchTrailer(selectedMovie)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-red-500 hover:bg-red-600 hover:scale-110 rounded-full transition-all shadow-lg shadow-red-500/30"
              >
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-bold mb-2">{selectedMovie.title}</h2>
              
              <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mb-4">
                {selectedMovie.rating && (
                  <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{selectedMovie.rating}</span>
                )}
                {getMovieYear(selectedMovie) > 0 && <span>{getMovieYear(selectedMovie)}</span>}
                {formatRuntime(selectedMovie.runtime || selectedMovie.duration) && (
                  <span>{formatRuntime(selectedMovie.runtime || selectedMovie.duration)}</span>
                )}
              </div>

              <button
                onClick={() => watchTrailer(selectedMovie)}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer on YouTube
              </button>

              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {selectedMovie.overview || 'No description available for this movie.'}
              </p>

              {(selectedMovie.genres?.length || selectedMovie.genre) && (
                <div className="flex flex-wrap gap-1.5">
                  {(selectedMovie.genres || [selectedMovie.genre]).filter(Boolean).map((g, idx) => {
                    const genreName = typeof g === 'object' && g !== null ? (g as { name?: string; title?: string }).name || (g as { name?: string; title?: string }).title || 'Unknown' : String(g)
                    return (
                      <span key={`genre-${idx}`} className="px-2 py-1 bg-white/5 rounded-full text-xs text-zinc-400 border border-white/10">{genreName}</span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Chat Window */}
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-linear-to-r from-red-500 to-orange-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="font-semibold text-white">Movie Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-500 text-white rounded-br-sm' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 px-4 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask for movie recommendations..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            chatOpen 
              ? 'bg-zinc-700 hover:bg-zinc-600' 
              : 'bg-linear-to-br from-red-500 to-orange-500 hover:scale-105'
          }`}
        >
          {chatOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-zinc-600">Powered by Movies API • Built with React + Tailwind CSS</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

export default App
