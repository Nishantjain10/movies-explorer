import { useState, useEffect, useCallback } from 'react'

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
      setCurrentPage(data.page || 1)
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
    const timer = setTimeout(() => fetchMovies(token, 1, searchQuery, selectedGenre), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre, token, fetchMovies])

  const handleGenre = (g: string) => setSelectedGenre(prev => prev === g ? '' : g)
  const handlePage = (p: number) => {
    if (token && p >= 1 && p <= totalPages) {
      fetchMovies(token, p, searchQuery, selectedGenre)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const formatRuntime = (m?: number) => m ? `${Math.floor(m/60)}h ${m%60}m` : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Glass Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top row: Logo + Search */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                </svg>
              </div>
              <span className="text-lg font-bold hidden sm:block">Movie<span className="text-red-500">Explorer</span></span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
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

            {/* Results count */}
            {!loading && totalResults > 0 && (
              <div className="hidden md:block text-sm text-zinc-400">
                <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
              </div>
            )}
          </div>

          {/* Genre pills */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedGenre('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !selectedGenre 
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
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile results count */}
        {!loading && totalResults > 0 && (
          <p className="md:hidden text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies found
            {selectedGenre && <span> in <span className="text-red-400">{selectedGenre}</span></span>}
          </p>
        )}

        {/* Loading skeleton */}
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

        {/* Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie, i) => (
              <div key={movie.id || i} onClick={() => setSelectedMovie(movie)} className="group cursor-pointer">
                {/* Poster */}
                <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 transition-all duration-200 group-hover:ring-2 group-hover:ring-red-500/50 group-hover:scale-[1.02]">
                  {movie.posterUrl && !imageErrors.has(movie.id) ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => setImageErrors(p => new Set(p).add(movie.id))}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-900">
                      <svg className="w-10 h-10 text-zinc-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      <span className="text-[10px] text-zinc-600 text-center line-clamp-2">{movie.title}</span>
                    </div>
                  )}
                  
                  {/* Rating badge */}
                  {movie.rating && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-semibold border border-white/20">
                      {movie.rating}
                    </span>
                  )}
                  
                  {/* Hover info */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      <p className="text-xs text-zinc-300 line-clamp-3">{movie.overview || 'No description'}</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-2 text-sm font-medium text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
                  {movie.title}
                </h3>
                {movie.year && <p className="text-xs text-zinc-600">{movie.year}</p>}
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && !error && movies.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-zinc-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-zinc-500">No movies found</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm border border-white/10 transition"
            >
              ← Prev
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let p = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) p = i + 1
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i
                  else p = currentPage - 2 + i
                }
                return (
                  <button
                    key={p}
                    onClick={() => handlePage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      currentPage === p ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
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

        {totalPages > 1 && !loading && (
          <p className="text-center text-zinc-600 text-xs mt-3">Page {currentPage} of {totalPages}</p>
        )}
      </main>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMovie(null)}>
          <div className="w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
            {/* Poster - smaller */}
            <div className="relative h-48 sm:h-56 bg-zinc-800">
              {selectedMovie.posterUrl && !imageErrors.has(selectedMovie.id) ? (
                <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <svg className="w-16 h-16 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-zinc-900 to-transparent" />
              
              {/* Close */}
              <button onClick={() => setSelectedMovie(null)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
