import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMovies, useChatbot, useFavorites } from './hooks'
import type { Movie } from './types'
import {
  AuthModal,
  GuestPromptModal,
  Navbar,
  GenrePills,
  FavoritesHeader,
  MovieGrid,
  MovieModal,
  LoadingSkeleton,
  EmptyState,
  Pagination,
  Chatbot,
  Footer
} from './components'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnFavoritesPage = location.pathname === '/favorites'

  // Movies hook
  const {
    token,
    movies,
    loading,
    loadingDetails,
    error,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    totalPages,
    totalResults,
    currentPage,
    imageErrors,
    handleImageError,
    handlePageChange,
    pageNumbers,
    fetchMovies,
    refetch
  } = useMovies()

  // Favorites hook
  const {
    user,
    authLoading,
    cloudFavorites,
    favorites,
    toggleFavorite,
    logout,
    guestPromptOpen,
    closeGuestPrompt,
    handleContinueAsGuest
  } = useFavorites(movies)

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')

  // Selected movie for modal
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  // Chatbot hook
  const chatbot = useChatbot({
    movies,
    setSelectedGenre: (genre: string) => setSelectedGenre(genre),
    token,
    fetchMovies,
    searchQuery,
    navigate
  })

  // Filtered movies for display
  const displayMovies = useMemo(() => 
    isOnFavoritesPage 
      ? movies.filter(m => favorites.includes(m.id))
      : movies,
    [isOnFavoritesPage, movies, favorites]
  )

  // Handlers
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre)
    if (isOnFavoritesPage) navigate('/')
  }

  const handleSignIn = () => {
    setAuthModalMode('login')
    setAuthModalOpen(true)
  }

  const handleSignUp = () => {
    setAuthModalMode('signup')
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/80 border-b border-white/5">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isOnFavoritesPage={isOnFavoritesPage}
          favorites={favorites}
          user={user}
          authLoading={authLoading}
          cloudFavorites={cloudFavorites}
          onLogout={logout}
          onSignIn={handleSignIn}
          totalResults={totalResults}
          loading={loading}
        />
        <GenrePills
          selectedGenre={selectedGenre}
          isOnFavoritesPage={isOnFavoritesPage}
          onGenreSelect={handleGenreChange}
        />
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Favorites Page Header */}
        {isOnFavoritesPage && (
          <FavoritesHeader
            user={user}
            authLoading={authLoading}
            favoritesCount={favorites.length}
            onSignUp={handleSignUp}
          />
        )}

        {/* Mobile Results Count */}
        {!loading && totalResults > 0 && !isOnFavoritesPage && (
          <p className="lg:hidden text-sm text-zinc-400 mb-4">
            <span className="text-white font-medium">{totalResults.toLocaleString()}</span> movies
            {selectedGenre && <span> in <span className="text-red-400">{selectedGenre}</span></span>}
          </p>
        )}

        {/* Error State */}
        {error && (
          <EmptyState type="error" message={error} onRetry={refetch} />
        )}

        {/* Loading State */}
        {loading && !error && <LoadingSkeleton />}

        {/* Movies Grid */}
        {!loading && !error && displayMovies.length > 0 && (
          <MovieGrid
            movies={displayMovies}
            favorites={favorites}
            imageErrors={imageErrors}
            loadingDetails={loadingDetails}
            onMovieSelect={setSelectedMovie}
            onToggleFavorite={toggleFavorite}
            onImageError={handleImageError}
          />
        )}

        {/* Empty State */}
        {!loading && !error && displayMovies.length === 0 && (
          <EmptyState type={isOnFavoritesPage ? 'no-favorites' : 'no-movies'} />
        )}

        {/* Pagination */}
        {!loading && !isOnFavoritesPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isFavorite={favorites.includes(selectedMovie.id)}
          hasImageError={imageErrors.has(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onToggleFavorite={() => toggleFavorite(selectedMovie.id)}
          onImageError={() => handleImageError(selectedMovie.id)}
        />
      )}

      {/* Chatbot */}
      <Chatbot
        isOpen={chatbot.isOpen}
        messages={chatbot.messages}
        isLoading={chatbot.isLoading}
        input={chatbot.input}
        onToggle={chatbot.toggle}
        onInputChange={chatbot.setInput}
        onSend={chatbot.sendMessage}
      />

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      {/* Guest Prompt Modal */}
      <GuestPromptModal
        isOpen={guestPromptOpen}
        onClose={closeGuestPrompt}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  )
}

export default App
