import { memo } from 'react'

interface LoadingSkeletonProps {
  count?: number
}

const LoadingSkeleton = memo(({ count = 15 }: LoadingSkeletonProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="aspect-2/3 rounded-xl bg-zinc-800/50 animate-pulse" />
        <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
))

LoadingSkeleton.displayName = 'LoadingSkeleton'

export default LoadingSkeleton
