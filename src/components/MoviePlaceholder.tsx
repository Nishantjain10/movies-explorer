import { memo } from 'react'

interface MoviePlaceholderProps {
  title: string
  size?: 'card' | 'modal'
}

const MoviePlaceholder = memo(({ title, size = 'card' }: MoviePlaceholderProps) => {
  const colors = [
    ['from-rose-900', 'to-pink-950'],
    ['from-violet-900', 'to-purple-950'],
    ['from-blue-900', 'to-indigo-950'],
    ['from-emerald-900', 'to-teal-950'],
    ['from-amber-900', 'to-orange-950'],
    ['from-cyan-900', 'to-sky-950'],
  ]
  const colorIndex = title.length % colors.length
  const [from, to] = colors[colorIndex]
  
  return (
    <div className={`w-full h-full bg-linear-to-br ${from} ${to} flex flex-col items-center justify-center ${size === 'modal' ? 'p-8' : 'p-4'}`}>
      <div className={`${size === 'modal' ? 'w-20 h-20' : 'w-12 h-12'} rounded-full bg-white/10 flex items-center justify-center mb-3`}>
        <svg className={`${size === 'modal' ? 'w-10 h-10' : 'w-6 h-6'} text-white/40`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
        </svg>
      </div>
      <span className={`${size === 'modal' ? 'text-base' : 'text-[11px]'} text-white/60 text-center line-clamp-2 font-medium px-2`}>
        {title}
      </span>
    </div>
  )
})

MoviePlaceholder.displayName = 'MoviePlaceholder'

export default MoviePlaceholder
