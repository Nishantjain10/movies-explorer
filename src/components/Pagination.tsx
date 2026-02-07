import { memo } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageNumbers: number[]
  onPageChange: (page: number) => void
}

const Pagination = memo(({
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange
}: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className="mt-10 mb-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg text-sm border border-white/10 transition"
        >
          Previous
        </button>
        
        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg text-sm border border-white/10 transition"
              >
                1
              </button>
              {pageNumbers[0] > 2 && <span className="text-zinc-600 px-1">...</span>}
            </>
          )}
          
          {pageNumbers.map(p => (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-sm cursor-pointer transition ${
                p === currentPage 
                  ? 'bg-red-500 text-white font-medium' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {p}
            </button>
          ))}
          
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-zinc-600 px-1">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg text-sm border border-white/10 transition"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-lg text-sm border border-white/10 transition"
        >
          Next
        </button>
      </div>
      
      <p className="text-center text-zinc-600 text-xs mt-3">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  )
})

Pagination.displayName = 'Pagination'

export default Pagination
