import { memo, useState, useEffect } from 'react'

interface LoadingSkeletonProps {
  count?: number
  isLandingPage?: boolean
}

const loadingMessages = [
  { text: "Discovering amazing movies for you...", icon: "film" },
  { text: "Add movies to your favorites list!", icon: "heart" },
  { text: "Search by title or browse by genre", icon: "search" },
  { text: "Your personal movie collection awaits", icon: "star" },
]

// Landing page loading screen with rotating messages
const LandingLoader = memo(() => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const currentMessage = loadingMessages[messageIndex]

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
      {/* Animated Icon */}
      <div className="relative mb-5 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
          {currentMessage.icon === "film" && (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          )}
          {currentMessage.icon === "heart" && (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
          {currentMessage.icon === "search" && (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
          {currentMessage.icon === "star" && (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          )}
        </div>
      </div>

      {/* Animated Text */}
      <div className="text-center space-y-3 sm:space-y-4">
        <p 
          key={messageIndex} 
          className="text-base sm:text-xl font-medium text-white animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {currentMessage.text}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
})

LandingLoader.displayName = 'LandingLoader'

// Regular skeleton grid for other pages
const SkeletonGrid = memo(({ count = 15 }: { count: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="aspect-2/3 rounded-xl bg-zinc-800/50 animate-pulse" />
        <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
))

SkeletonGrid.displayName = 'SkeletonGrid'

// Main component - shows different loaders based on context
const LoadingSkeleton = memo(({ count = 15, isLandingPage = false }: LoadingSkeletonProps) => {
  if (isLandingPage) {
    return <LandingLoader />
  }
  return <SkeletonGrid count={count} />
})

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton
