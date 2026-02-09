// API
export const API_BASE_URL = 'https://0kadddxyh3.execute-api.us-east-1.amazonaws.com'
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Genre list
export const GENRES = [
  'Action',
  'Adventure', 
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western'
] as const

export type GenreType = typeof GENRES[number]
