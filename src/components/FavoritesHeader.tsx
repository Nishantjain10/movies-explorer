import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../lib/appwrite'

interface FavoritesHeaderProps {
  user: User | null
  authLoading: boolean
  favoritesCount: number
  onSignUp: () => void
}

const FavoritesHeader = memo(({
  user,
  authLoading,
  favoritesCount,
  onSignUp
}: FavoritesHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Guest banner */}
      {!authLoading && !user && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Save your favorites across devices</p>
              <p className="text-xs text-zinc-400">Create a free account to sync your movie collection</p>
            </div>
          </div>
          <button
            onClick={onSignUp}
            className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Favorites</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {favoritesCount === 0 
              ? 'No favorites yet. Click the heart on movies to add them!'
              : `${favoritesCount} favorite${favoritesCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium border border-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to Movies</span>
        </Link>
      </div>

      {/* Synced badge */}
      {user && (
        <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Synced to cloud
        </p>
      )}
    </div>
  )
})

FavoritesHeader.displayName = 'FavoritesHeader'

export default FavoritesHeader
