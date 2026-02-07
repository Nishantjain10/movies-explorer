import type { Movie } from '../types'

// Cache for movie details
export const movieCache = new Map<string, Movie>()

// Generate YouTube trailer search URL
export const getTrailerUrl = (title: string, year?: number): string => {
  const query = encodeURIComponent(`${title} ${year || ''} official trailer`)
  return `https://www.youtube.com/results?search_query=${query}`
}

// Extract year from movie data
export const getMovieYear = (movie: Movie): number => {
  if (movie.year && typeof movie.year === 'number') return movie.year
  if (movie.releaseDate) {
    const parsed = parseInt(String(movie.releaseDate).substring(0, 4))
    if (!isNaN(parsed) && parsed > 1800 && parsed < 2100) return parsed
  }
  return 0
}

// Format runtime to hours and minutes
export const formatRuntime = (m?: number): string | null => {
  if (!m || isNaN(m) || m <= 0) return null
  const hours = Math.floor(m / 60)
  const mins = m % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Parse ISO 8601 duration (e.g., "PT2H2M", "PT1H30M", "PT42M")
export const parseDuration = (duration?: string): string | null => {
  if (!duration || typeof duration !== 'string') return null
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null
  
  const hours = parseInt(match[1] || '0', 10)
  const mins = parseInt(match[2] || '0', 10)
  
  if (hours === 0 && mins === 0) return null
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Get genre name from genre object or string
export const getGenreName = (g: string | { name?: string; title?: string }): string => {
  if (typeof g === 'object' && g !== null) {
    return g.name || g.title || 'Unknown'
  }
  return String(g)
}
