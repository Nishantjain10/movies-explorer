# Movie Explorer

A Netflix-inspired movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations and an intuitive browsing experience.

## Features

- **Movie Search**: Search for movies by title with real-time results
- **Genre Filtering**: Filter movies by genre (Action, Comedy, Drama, etc.)
- **Pagination**: Navigate through paginated search results
- **Movie Details**: View detailed information including poster, rating, runtime, and overview
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Dark theme with smooth animations and transitions

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
- Movie trailers integration (YouTube API)
- User favorites/watchlist (with local storage)
- Advanced filtering (year, rating range)
- Infinite scroll as an alternative to pagination
- Unit and integration tests

## API

This app uses the Movies API for movie data.
- Base URL: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`
- Authentication via Bearer token

## License

MIT
