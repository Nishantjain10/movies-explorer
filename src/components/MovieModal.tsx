import { memo } from 'react'
import type { Movie } from '../types'
import { getMovieYear, formatRuntime, parseDuration, getTrailerUrl, getGenreName } from '../utils'
import MoviePlaceholder from './MoviePlaceholder'

interface MovieModalProps {
  movie: Movie
  isFavorite: boolean
  hasImageError: boolean
  onClose: () => void
  onToggleFavorite: () => void
  onImageError: () => void
}

const MovieModal = memo(({
  movie,
  isFavorite,
  hasImageError,
  onClose,
  onToggleFavorite,
  onImageError
}: MovieModalProps) => {
  const hasValidPoster = movie.posterUrl && !hasImageError
  const movieYear = getMovieYear(movie)
  // Parse duration - API returns ISO 8601 format (e.g., "PT2H2M")
  const runtime = parseDuration(movie.duration) || formatRuntime(movie.runtime)

  const watchTrailer = () => {
    const url = getTrailerUrl(movie.title, movieYear)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm md:max-w-md lg:max-w-lg bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster */}
        <div className="relative aspect-video md:aspect-[16/10]">
          {hasValidPoster ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-full h-full object-cover" 
              onError={onImageError}
            />
          ) : (
            <MoviePlaceholder title={movie.title} size="modal" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full cursor-pointer transition"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Favorite Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
            className={`absolute top-3 left-3 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full cursor-pointer transition ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Play Button */}
          <button
            onClick={watchTrailer}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 flex items-center justify-center bg-red-500 hover:bg-red-600 hover:scale-110 rounded-full cursor-pointer transition-all shadow-lg shadow-red-500/30"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">{movie.title}</h2>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-xs md:text-sm text-zinc-400 mb-4">
            {movie.rating && (
              <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10">{movie.rating}</span>
            )}
            {movieYear > 0 && <span>{movieYear}</span>}
            {runtime && <span>• {runtime}</span>}
          </div>

          {/* Watch Trailer Button */}
          <button
            onClick={watchTrailer}
            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-sm md:text-base font-medium cursor-pointer transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Trailer on YouTube
          </button>

          {/* Genres */}
          {(movie.genres?.length || movie.genre) && (
            <div className="flex flex-wrap gap-2">
              {(movie.genres || [movie.genre]).filter(Boolean).map((g, idx) => (
                <span 
                  key={`genre-${idx}`} 
                  className="px-2.5 py-1 bg-white/5 rounded-full text-xs md:text-sm text-zinc-400 border border-white/10"
                >
                  {getGenreName(g as string | { name?: string; title?: string })}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MovieModal.displayName = 'MovieModal'

export default MovieModal
