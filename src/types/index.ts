// Movie types
export interface MovieSummary {
  id: string
  title: string
}

export interface Genre {
  id?: string
  name?: string
  title?: string
}

export interface Movie {
  id: string
  title: string
  posterUrl?: string
  rating?: string
  overview?: string
  genres?: (string | Genre)[]
  genre?: string
  runtime?: number
  duration?: string // ISO 8601 format e.g., "PT2H2M"
  year?: number
  releaseDate?: string
}

export interface MoviesResponse {
  data: MovieSummary[]
  totalPages: number
  page: number
  total: number
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
