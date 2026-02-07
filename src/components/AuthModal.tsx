import { useState, memo } from 'react'
import { useAuth } from '../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'magic'

export const AuthModal = memo(function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup, sendMagicLink, forgotPassword } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      switch (mode) {
        case 'login':
          await login(email, password)
          onClose()
          break
        case 'signup':
          if (!name.trim()) {
            setError('Please enter your name')
            setLoading(false)
            return
          }
          await signup(email, password, name)
          onClose()
          break
        case 'forgot':
          await forgotPassword(email)
          setSuccess('Password reset link sent! Check your email.')
          break
        case 'magic':
          await sendMagicLink(email)
          setSuccess('Magic link sent! Check your email to sign in.')
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'magic' && 'Magic Link Sign In'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'login' && 'Sign in to sync your favorites across devices'}
            {mode === 'signup' && 'Join to save your favorite movies online'}
            {mode === 'forgot' && 'Enter your email to receive a reset link'}
            {mode === 'magic' && 'Get a sign-in link sent to your email'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              required
            />
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                required
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-zinc-500">Minimum 8 characters</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
                {mode === 'magic' && 'Send Magic Link'}
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="px-6 pb-6 space-y-3">
          {mode === 'login' && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-zinc-500">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              
              <button
                type="button"
                onClick={() => switchMode('magic')}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-white/10"
              >
                Sign in with Magic Link
              </button>
              
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Create account
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Sign in
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'magic') && (
            <p className="text-center text-sm text-zinc-400">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
