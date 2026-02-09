import { memo } from 'react'
import type { Movie } from '../types'
import MovieCard from './MovieCard'

interface MovieGridProps {
  movies: Movie[]
  favorites: string[]
  imageErrors: Set<string>
  loadingDetails: Set<string>
  onMovieSelect: (movie: Movie) => void
  onToggleFavorite: (movieId: string, e: React.MouseEvent) => void
  onImageError: (movieId: string) => void
}

const MovieGrid = memo(({
  movies,
  favorites,
  imageErrors,
  loadingDetails,
  onMovieSelect,
  onToggleFavorite,
  onImageError
}: MovieGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favorites.includes(movie.id)}
          hasError={imageErrors.has(movie.id)}
          isLoading={loadingDetails.has(movie.id)}
          onSelect={() => onMovieSelect(movie)}
          onToggleFavorite={(e) => onToggleFavorite(movie.id, e)}
          onImageError={() => onImageError(movie.id)}
        />
      ))}
    </div>
  )
})

MovieGrid.displayName = 'MovieGrid'

export default MovieGrid
