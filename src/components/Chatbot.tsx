import { memo, useRef, useEffect } from 'react'
import type { ChatMessage } from '../types'

interface ChatbotProps {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  input: string
  onToggle: () => void
  onInputChange: (value: string) => void
  onSend: () => void
}

const Chatbot = memo(({
  isOpen,
  messages,
  isLoading,
  input,
  onToggle,
  onInputChange,
  onSend
}: ChatbotProps) => {
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && input.trim()) {
      onSend()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-linear-to-r from-red-500 to-orange-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="font-semibold text-white">Movie Assistant</span>
            </div>
            <button onClick={onToggle} className="text-white/80 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-red-500 text-white rounded-br-sm' 
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-4 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for movie recommendations..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
              />
              <button
                onClick={onSend}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isOpen 
            ? 'bg-zinc-700 hover:bg-zinc-600' 
            : 'bg-linear-to-br from-red-500 to-orange-500 hover:scale-105'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
    </div>
  )
})

Chatbot.displayName = 'Chatbot'

export default Chatbot
