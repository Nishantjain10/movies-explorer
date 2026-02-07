import { useState, useEffect, useCallback } from 'react'

// API Configuration
const API_BASE_URL = 'https://0kadddxyh3.execute-api.us-east-1.amazonaws.com'

// Types
interface Movie {
  id: string
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  vote_count: number
  release_date: string
  runtime: number
  genres: string[]
}

interface MoviesResponse {
  data: Movie[]
  totalPages: number
  page: number
  limit: number
  total: number
}

// Genre list for filtering
const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
]

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  // Fetch auth token
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`)
      const data = await response.json()
      setToken(data.token)
      return data.token
    } catch (err) {
      setError('Failed to authenticate. Please try again.')
      return null
    }
  }, [])

  // Fetch movies
  const fetchMovies = useCallback(async (authToken: string, page = 1, search = '', genre = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (search) params.append('search', search)
      if (genre) params.append('genre', genre)
      
      const response = await fetch(`${API_BASE_URL}/movies?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }
      
      const data: MoviesResponse = await response.json()
      setMovies(data.data)
      setTotalPages(data.totalPages)
      setTotalResults(data.total)
      setCurrentPage(data.page)
    } catch (err) {
      setError('Failed to load movies. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize app
  useEffect(() => {
    const init = async () => {
      const authToken = await fetchToken()
      if (authToken) {
        fetchMovies(authToken)
      }
    }
    init()
  }, [fetchToken, fetchMovies])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (token) {
      setCurrentPage(1)
      fetchMovies(token, 1, searchQuery, selectedGenre)
    }
  }

  // Handle genre filter
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre)
    setCurrentPage(1)
    if (token) {
      fetchMovies(token, 1, searchQuery, genre)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (token && page >= 1 && page <= totalPages) {
      fetchMovies(token, page, searchQuery, selectedGenre)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Get poster URL
  const getPosterUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/300x450?text=No+Poster'
    return `https://image.tmdb.org/t/p/w500${path}`
  }

  // Format runtime
  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <h1 className="text-2xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              🎬 MovieSearch
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          
          {/* Genre Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleGenreChange('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === ''
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Genres
            </button>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        {!loading && totalResults > 0 && (
          <p className="text-slate-400 mb-6">
            Found <span className="text-white font-semibold">{totalResults}</span> movies
            {searchQuery && <span> for "<span className="text-red-400">{searchQuery}</span>"</span>}
            {selectedGenre && <span> in <span className="text-red-400">{selectedGenre}</span></span>}
          </p>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-xl text-slate-300">{error}</p>
            <button
              onClick={() => token && fetchMovies(token, currentPage, searchQuery, selectedGenre)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">Loading movies...</p>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-slate-800 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/20">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-yellow-400">
                          ⭐ {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{formatRuntime(movie.runtime)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-semibold text-yellow-400">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl text-slate-300">No movies found</p>
            <p className="text-slate-500 mt-2">Try a different search or genre</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMovie(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Backdrop Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={selectedMovie.backdrop_path 
                  ? `https://image.tmdb.org/t/p/w1280${selectedMovie.backdrop_path}`
                  : getPosterUrl(selectedMovie.poster_path)
                }
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="relative -mt-20 px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="shrink-0">
                  <img
                    src={getPosterUrl(selectedMovie.poster_path)}
                    alt={selectedMovie.title}
                    className="w-32 md:w-48 rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {selectedMovie.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      ⭐ {selectedMovie.vote_average.toFixed(1)}
                    </span>
                    <span>({selectedMovie.vote_count.toLocaleString()} votes)</span>
                    <span>•</span>
                    <span>{formatRuntime(selectedMovie.runtime)}</span>
                    <span>•</span>
                    <span>{selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A'}</span>
                  </div>
                  
                  {/* Genres */}
                  {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedMovie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Overview */}
                  <p className="text-slate-300 leading-relaxed">
                    {selectedMovie.overview || 'No overview available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>Movie data provided by Movies API</p>
        </div>
      </footer>
    </div>
  )
}

export default App
