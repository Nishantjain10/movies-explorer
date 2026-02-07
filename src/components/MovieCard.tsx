import { memo } from 'react'
import type { Movie } from '../types'
import { getMovieYear } from '../utils'
import MoviePlaceholder from './MoviePlaceholder'

interface MovieCardProps {
  movie: Movie
  isFavorite: boolean
  hasError: boolean
  isLoading: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onImageError: () => void
}

const MovieCard = memo(({ 
  movie, 
  isFavorite, 
  hasError, 
  isLoading, 
  onSelect, 
  onToggleFavorite, 
  onImageError 
}: MovieCardProps) => {
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
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white/70 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/70'
          }`}
        >
          <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <h3 className="mt-2.5 text-sm md:text-base font-medium text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
        {movie.title}
      </h3>
      {movieYear > 0 && <p className="text-xs md:text-sm text-zinc-500 mt-0.5">{movieYear}</p>}
    </div>
  )
})

MovieCard.displayName = 'MovieCard'

export default MovieCard
