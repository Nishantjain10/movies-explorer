import { useState, useCallback } from 'react'
import { GENRES, GEMINI_API_KEY } from '../constants'
import type { Movie, ChatMessage } from '../types'

interface UseChatbotProps {
  movies: Movie[]
  setSelectedGenre: (genre: string) => void
  token: string | null
  fetchMovies: (token: string, page: number, search: string, genre: string) => void
  searchQuery: string
  navigate: (path: string) => void
}

export function useChatbot({
  movies,
  setSelectedGenre,
  token,
  fetchMovies,
  searchQuery,
  navigate
}: UseChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your movie recommendation assistant. Tell me what kind of movie you're in the mood for, and I'll suggest something great!" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Detect genre from user message
  const detectGenre = useCallback((message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    for (const genre of GENRES) {
      if (lowerMessage.includes(genre.toLowerCase())) {
        return genre
      }
    }
    const aliases: Record<string, string> = {
      'scary': 'Horror', 'funny': 'Comedy', 'romantic': 'Romance', 'love': 'Romance',
      'sci-fi': 'Science Fiction', 'scifi': 'Science Fiction', 'animated': 'Animation',
      'cartoon': 'Animation', 'kids': 'Family', 'children': 'Family', 'suspense': 'Thriller',
      'historical': 'History', 'musical': 'Music', 'doc': 'Documentary', 'criminal': 'Crime'
    }
    for (const [alias, genre] of Object.entries(aliases)) {
      if (lowerMessage.includes(alias)) return genre
    }
    return null
  }, [])

  // Get smart response based on intent
  const getSmartResponse = useCallback((message: string): string | null => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('rated') || lowerMessage.includes('popular')) {
      const topMovies = movies.filter(m => m.rating).slice(0, 3)
      if (topMovies.length > 0) {
        const movieList = topMovies.map(m => `"${m.title}"`).join(', ')
        return `Here are some great picks: ${movieList}. Click on any movie to see more details!`
      }
      return "Check out the movies on screen - click any one to see its rating and details!"
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      const randomMovies = [...movies].sort(() => Math.random() - 0.5).slice(0, 3)
      if (randomMovies.length > 0) {
        const movieList = randomMovies.map(m => `"${m.title}"`).join(', ')
        return `I'd suggest: ${movieList}. Or tell me a genre you like!`
      }
    }
    
    if (lowerMessage.includes('help')) {
      return `I can help you discover movies! Say a genre like "action" or "comedy", ask for "recommendations", or say "show all" to clear filters.`
    }
    
    return null
  }, [movies])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    
    const lowerMessage = userMessage.toLowerCase()
    
    // Handle clear/reset
    if (lowerMessage.includes('all movies') || lowerMessage.includes('show all') || lowerMessage.includes('clear') || lowerMessage.includes('reset')) {
      setSelectedGenre('')
      navigate('/')
      if (token) fetchMovies(token, 1, searchQuery, '')
      setMessages(prev => [...prev, { role: 'assistant', content: "Done! I've cleared all filters. What genre are you in the mood for?" }])
      setIsLoading(false)
      return
    }
    
    // Check for genre
    const detectedGenre = detectGenre(userMessage)
    if (detectedGenre) {
      setSelectedGenre(detectedGenre)
      navigate('/')
      if (token) fetchMovies(token, 1, searchQuery, detectedGenre)
      setMessages(prev => [...prev, { role: 'assistant', content: `Great choice! I've applied the ${detectedGenre} filter. Check out the movies!` }])
      setIsLoading(false)
      return
    }
    
    // Check for smart response
    const smartResponse = getSmartResponse(userMessage)
    if (smartResponse) {
      setMessages(prev => [...prev, { role: 'assistant', content: smartResponse }])
      setIsLoading(false)
      return
    }
    
    // Try Gemini API
    try {
      const movieContext = movies.slice(0, 5).map(m => m.title).join(', ')
      const prompt = `You are a helpful movie assistant. Available genres: ${GENRES.join(', ')}. Currently showing: ${movieContext}. User says: "${userMessage}" Give a brief, friendly response (1-2 sentences).`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
        })
      })
      
      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      } else {
        throw new Error('No response')
      }
    } catch {
      const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']
      const randomGenre = genres[Math.floor(Math.random() * genres.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: `Try asking for a genre! For example, say "${randomGenre.toLowerCase()}" and I'll filter the movies for you.` }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, token, searchQuery, fetchMovies, navigate, setSelectedGenre, detectGenre, getSmartResponse, movies])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    messages,
    isLoading,
    input,
    setInput,
    sendMessage,
    toggle
  }
}
