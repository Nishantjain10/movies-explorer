import { memo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GENRES } from '../constants'

interface GenrePillsProps {
  selectedGenre: string
  isOnFavoritesPage: boolean
  onGenreSelect: (genre: string) => void
}

const GenrePills = memo(({
  selectedGenre,
  isOnFavoritesPage,
  onGenreSelect
}: GenrePillsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ 
      left: direction === 'right' ? 200 : -200, 
      behavior: 'smooth' 
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-2 border-t border-white/5">
      {/* Scroll Left */}
      <button 
        onClick={() => scroll('left')} 
        className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-zinc-400 hover:text-white cursor-pointer transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pills */}
      <div ref={scrollRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
        <Link
          to="/"
          onClick={() => onGenreSelect('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            !selectedGenre && !isOnFavoritesPage
              ? 'bg-red-500 text-white' 
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          All
        </Link>
        
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => onGenreSelect(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
              selectedGenre === genre 
                ? 'bg-red-500 text-white' 
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Scroll Right */}
      <button 
        onClick={() => scroll('right')} 
        className="shrink-0 w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-zinc-400 hover:text-white cursor-pointer transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
})

GenrePills.displayName = 'GenrePills'

export default GenrePills
