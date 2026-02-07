import { useState, useEffect, useCallback, useRef } from 'react'

// API
const API_BASE_URL = 'https://0kadddxyh3.execute-api.us-east-1.amazonaws.com'

// Types
interface Movie {
  id: string
  title: string
  posterUrl?: string
  rating?: string
  overview?: string
  genres?: string[]
  genre?: string
  runtime?: number
  duration?: number
  year?: number
}

interface MoviesResponse {
  data: Movie[]
  totalPages: number
  page: number
  total: number
}

// Genres
const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western']

// Year ranges
const YEAR_RANGES = [
  { label: 'All Years', min: 0, max: 9999 },
  { label: '2020s', min: 2020, max: 2029 },
  { label: '2010s', min: 2010, max: 2019 },
  { label: '2000s', min: 2000, max: 2009 },
  { label: '1990s', min: 1990, max: 1999 },
  { label: '1980s', min: 1980, max: 1989 },
  { label: 'Classics', min: 0, max: 1979 },
]

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

// Generate YouTube URLs
const getTrailerSearchUrl = (title: string, year?: number) => {
  const query = encodeURIComponent(`${title} ${year || ''} official trailer`)
  return `https://www.youtube.com/results?search_query=${query}`
}

const getTrailerEmbedUrl = (title: string, year?: number) => {
  const query = encodeURIComponent(`${title} ${year || ''} official trailer`)
  return `https://www.youtube.com/embed?listType=search&list=${query}`
}

// Placeholder component with nice gradient
const MoviePlaceholder = ({ title, size = 'card' }: { title: string; size?: 'card' | 'modal' }) => {
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
}

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<string[]>(getFavorites)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [yearRange, setYearRange] = useState({ min: 0, max: 9999 })
  const [ratingFilter, setRatingFilter] = useState<string>('all') // 'all', 'G', 'PG', 'PG-13', 'R'
  const genreScrollRef = useRef<HTMLDivElement>(null)

  // Toggle favorite
  const toggleFavorite = (movieId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFavorites(prev => {
      const newFavs = prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
      saveFavorites(newFavs)
      return newFavs
    })
  }

  // Open trailer in modal
  const playTrailer = () => {
    setShowTrailer(true)
  }

  // Scroll genres
  const scrollGenres = (direction: 'left' | 'right') => {
    if (genreScrollRef.current) {
      genreScrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      })
    }
  }

  // Fetch token
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

  // Fetch movies
  const fetchMovies = useCallback(async (authToken: string, page = 1, search = '', genre = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      if (genre) params.append('genre', genre)
      
      const res = await fetch(`${API_BASE_URL}/movies?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error()
      
      const data: MoviesResponse = await res.json()
      setMovies(data.data || [])
      setTotalPages(data.totalPages || 1)
      setTotalResults(data.total || 0)
      setCurrentPage(page)
      setImageErrors(new Set())
    } catch {
      setError('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }, [])

  // Init
  useEffect(() => {
    fetchToken().then(t => t && fetchMovies(t))
  }, [fetchToken, fetchMovies])

  // Search with debounce
  useEffect(() => {
    if (!token) return
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchMovies(token, 1, searchQuery, selectedGenre)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre, token, fetchMovies])

  const handleGenre = (g: string) => {
    setSelectedGenre(prev => prev === g ? '' : g)
    setShowFavoritesOnly(false)
  }

  const handlePage = (p: number) => {
    if (token && p >= 1 && p <= totalPages) {
      fetchMovies(token, p, searchQuery, selectedGenre)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeModal = () => {
    setSelectedMovie(null)
    setShowTrailer(false)
  }

  const formatRuntime = (m?: number) => m ? `${Math.floor(m/60)}h ${m%60}m` : null

  // Filter movies by year and rating (client-side)
  const filteredMovies = movies.filter(movie => {
    // Year filter
    if (yearRange.min > 0 || yearRange.max < 9999) {
      const movieYear = movie.year || 0
      if (movieYear < yearRange.min || movieYear > yearRange.max) return false
    }
    // Rating filter
    if (ratingFilter !== 'all' && movie.rating !== ratingFilter) return false
    return true
  })

  const displayMovies = showFavoritesOnly 
    ? filteredMovies.filter(m => favorites.includes(m.id))
    : filteredMovies

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const hasValidPoster = (movie: Movie) => movie.posterUrl && !imageErrors.has(movie.id)

  const activeFiltersCount = (yearRange.min > 0 || yearRange.max < 9999 ? 1 : 0) + (ratingFilter !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - Left */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                </svg>
              </div>
              <span className="text-lg font-bold hidden sm:block">Movie<span className="text-red-500">Explorer</span></span>
            </div>

            {/* Right side - Search, Filters, Favorites, Count */}
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

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px]">{activeFiltersCount}</span>
                )}
              </button>

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

              {!loading && totalResults > 0 && !showFavoritesOnly && (
                <div className="hidden lg:block text-sm text-zinc-400 pl-2 border-l border-white/10">
                  <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
                </div>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex flex-wrap gap-6">
                {/* Year Range */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-medium">Release Year</label>
                  <div className="flex gap-2">
                    {YEAR_RANGES.map(range => (
                      <button
                        key={range.label}
                        onClick={() => setYearRange({ min: range.min, max: range.max })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          yearRange.min === range.min && yearRange.max === range.max
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-medium">Content Rating</label>
                  <div className="flex gap-2">
                    {['all', 'G', 'PG', 'PG-13', 'R'].map(r => (
                      <button
                        key={r}
                        onClick={() => setRatingFilter(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          ratingFilter === r
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {r === 'all' ? 'All Ratings' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-end">
                    <button
                      onClick={() => { setYearRange({ min: 0, max: 9999 }); setRatingFilter('all') }}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
            <h2 className="text-xl font-semibold">My Favorites</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {favorites.length === 0 
                ? 'No favorites yet. Click the heart on movies to add them!'
                : `${displayMovies.length} of ${favorites.length} favorites shown`}
            </p>
          </div>
        )}

        {!loading && totalResults > 0 && !showFavoritesOnly && (
          <p className="lg:hidden text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
            {selectedGenre && <span> in <span className="text-red-400">{selectedGenre}</span></span>}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-2/3 rounded-xl bg-zinc-800/50 animate-pulse" />
                <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">{error}</p>
            <button onClick={() => token && fetchMovies(token)} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition">
              Retry
            </button>
          </div>
        )}

        {/* Movies */}
        {!loading && !error && displayMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayMovies.map((movie, i) => {
              const isFavorite = favorites.includes(movie.id)
              return (
                <div key={movie.id || i} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer">
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 transition-all duration-200 group-hover:ring-2 group-hover:ring-red-500/50 group-hover:scale-[1.02]">
                    {hasValidPoster(movie) ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setImageErrors(p => new Set(p).add(movie.id))}
                      />
                    ) : (
                      <MoviePlaceholder title={movie.title} size="card" />
                    )}
                    
                    {movie.rating && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-semibold border border-white/20">
                        {movie.rating}
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(movie.id, e)}
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
                    
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-zinc-300 line-clamp-3">{movie.overview || 'No description'}</p>
                    </div>
                  </div>

                  <h3 className="mt-2 text-sm font-medium text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
                    {movie.title}
                  </h3>
                  {movie.year && <p className="text-xs text-zinc-600">{movie.year}</p>}
                </div>
              )
            })}
          </div>
        )}

        {/* No results */}
        {!loading && !error && displayMovies.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-zinc-500">{showFavoritesOnly ? 'No favorites yet' : 'No movies found'}</p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={() => { setYearRange({ min: 0, max: 9999 }); setRatingFilter('all') }}
                className="mt-3 text-sm text-red-400 hover:text-red-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
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
              {getPageNumbers().map(p => (
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

      {/* Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl overflow-hidden ring-1 ring-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Trailer or Poster */}
            {showTrailer ? (
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  src={getTrailerEmbedUrl(selectedMovie.title, selectedMovie.year)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${selectedMovie.title} trailer`}
                />
                {/* Back to details */}
                <button 
                  onClick={() => setShowTrailer(false)} 
                  className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
            ) : (
              <div className="relative h-52 sm:h-60 bg-zinc-800">
                {hasValidPoster(selectedMovie) ? (
                  <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="w-full h-full object-cover" />
                ) : (
                  <MoviePlaceholder title={selectedMovie.title} size="modal" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                
                {/* Close */}
                <button onClick={closeModal} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Favorite */}
                <button
                  onClick={(e) => toggleFavorite(selectedMovie.id, e)}
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

                {/* Play Trailer Button - centered */}
                <button
                  onClick={playTrailer}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center bg-red-500 hover:bg-red-600 hover:scale-110 rounded-full transition-all shadow-lg shadow-red-500/30"
                >
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2">{selectedMovie.title}</h2>
              
              {/* Meta */}
              <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mb-4">
                {selectedMovie.rating && (
                  <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{selectedMovie.rating}</span>
                )}
                {selectedMovie.year && <span>{selectedMovie.year}</span>}
                {formatRuntime(selectedMovie.runtime || selectedMovie.duration) && (
                  <span>{formatRuntime(selectedMovie.runtime || selectedMovie.duration)}</span>
                )}
              </div>

              {/* Trailer Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={playTrailer}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {showTrailer ? 'Playing...' : 'Watch Trailer'}
                </button>
                <a
                  href={getTrailerSearchUrl(selectedMovie.title, selectedMovie.year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z" />
                  </svg>
                  YouTube
                </a>
              </div>

              {/* Overview */}
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {selectedMovie.overview || 'No description available for this movie.'}
              </p>

              {/* Genres */}
              {(selectedMovie.genres?.length || selectedMovie.genre) && (
                <div className="flex flex-wrap gap-1.5">
                  {(selectedMovie.genres || [selectedMovie.genre]).filter(Boolean).map(g => (
                    <span key={g} className="px-2 py-1 bg-white/5 rounded-full text-xs text-zinc-400 border border-white/10">{g}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-zinc-600">Powered by Movies API • Built with React + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

export default App
