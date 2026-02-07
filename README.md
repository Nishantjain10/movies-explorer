# Movie Explorer

A Netflix-inspired movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations and an intuitive browsing experience.

## Features

- **Movie Search**: Search for movies by title with real-time debounced results
- **Genre Filtering**: Filter movies by 18 genres with scrollable pill navigation
- **Favorites/Watchlist**: Save movies to favorites (persisted in local storage)
- **Pagination**: Navigate through paginated results with smart page numbers
- **Movie Details**: View detailed information including poster, rating, runtime, and overview
- **Movie Trailers**: Watch trailers via YouTube search integration
- **AI Movie Assistant**: Smart chatbot that filters movies by genre, recommends titles, and helps discover content
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Glassmorphism navbar, dark theme, smooth hover effects

## Tech Stack

- **React 19** - Modern React with hooks and memoization
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Gemini AI** - Powers the movie recommendation chatbot

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Nishantjain10/movies-explorer.git
cd movies-explorer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file with:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

## AI Movie Assistant

The chatbot in the bottom-right corner can:
- **Filter by genre**: Say "action", "comedy", "drama", etc.
- **Get recommendations**: Ask for "best movies" or "suggest something"
- **Clear filters**: Say "show all" or "reset"
- **Natural language**: "I want something scary" → filters to Horror

## Highlights

### What I Found Interesting
The implementation of the genre filtering system with a horizontal scrollable pill-based UI provides an intuitive way for users to quickly filter content. Combined with the AI chatbot, it creates a powerful yet simple discovery experience.

### What I'm Most Proud Of
The overall user experience - from the smooth hover animations on movie cards to the elegant modal for movie details, and the smart AI assistant that understands natural language. The design balances aesthetics with functionality.

### Future Improvements
Given more time, I would add:
- Infinite scroll as an alternative to pagination
- Unit and integration tests
- User authentication for cloud-synced favorites

## API

This app uses the Movies API for movie data:
- Base URL: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`
- Authentication via Bearer token (auto-fetched)

## License

MIT
