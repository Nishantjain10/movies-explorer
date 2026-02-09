import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../lib/appwrite'
import type { Favorite } from '../lib/appwrite'

interface NavbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  isOnFavoritesPage: boolean
  favorites: string[]
  user: User | null
  authLoading: boolean
  cloudFavorites: Favorite[]
  onLogout: () => void
  onSignIn: () => void
}

const Navbar = memo(({
  searchQuery,
  onSearchChange,
  isOnFavoritesPage,
  favorites,
  user,
  authLoading,
  cloudFavorites,
  onLogout,
  onSignIn
}: NavbarProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
        </div>
        <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          MovieExplorer
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Favorites */}
        <Link
          to="/favorites"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            isOnFavoritesPage 
              ? 'bg-red-500 text-white border-red-500' 
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill={isOnFavoritesPage ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="hidden sm:inline">Favorites</span>
          {favorites.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${isOnFavoritesPage ? 'bg-white/20' : 'bg-white/10'}`}>
              {favorites.length}
            </span>
          )}
        </Link>

        {/* Auth */}
        {!authLoading && (
          user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium border border-white/10 cursor-pointer transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name || 'User'}</span>
                <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Cloud favorites</span>
                      <span className="text-xs font-medium text-white bg-white/10 px-2 py-0.5 rounded-full">{cloudFavorites.length}</span>
                    </div>
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false) }}
                      className="w-full mt-1 px-3 py-2.5 flex items-center gap-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-sm font-semibold cursor-pointer transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )
        )}

      </div>
    </div>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
