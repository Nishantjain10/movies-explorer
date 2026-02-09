import { memo } from 'react'

const Footer = memo(() => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-7xl mx-auto px-4 py-6 text-center">
      <p className="text-xs text-zinc-600">
        Powered by Movies API • Built with React + Tailwind CSS
      </p>
    </div>
  </footer>
))

Footer.displayName = 'Footer'

export default Footer
