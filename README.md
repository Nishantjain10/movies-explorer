# Movie Explorer

A Netflix-inspired movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations and an intuitive browsing experience.

## Features

- **Movie Search**: Search for movies by title with real-time debounced results
- **Genre Filtering**: Filter movies by genre with scrollable pill navigation
- **Favorites/Watchlist**: Save movies to favorites (persisted in local storage)
- **Pagination**: Navigate through paginated results with smart page numbers
- **Movie Details**: View detailed information including poster, rating, runtime, and overview
- **Movie Trailers**: Watch trailers via YouTube search integration
- **Advanced Filtering**: Filter by release year (decades) and content rating (G, PG, PG-13, R)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Glassmorphism navbar, dark theme, smooth hover effects

## Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Highlights

### What I Found Interesting
The implementation of the genre filtering system with a horizontal scrollable pill-based UI provides an intuitive way for users to quickly filter content. Combined with the search functionality, it creates a powerful yet simple discovery experience.

### What I'm Most Proud Of
The overall user experience - from the smooth hover animations on movie cards to the elegant modal for movie details. The design balances aesthetics with functionality, making the app both visually appealing and easy to use.

### Future Improvements
Given more time, I would add:
- Infinite scroll as an alternative to pagination
- Unit and integration tests
- User authentication for cloud-synced favorites

## API

This app uses the Movies API for movie data.
- Base URL: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`
- Authentication via Bearer token

## License

MIT
