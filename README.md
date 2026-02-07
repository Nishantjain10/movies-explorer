# Movie Explorer

A modern movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations, user authentication, and an intelligent AI chatbot for personalized recommendations.

![Movie Explorer Screenshot](https://github.com/user-attachments/assets/d653052c-5129-4f48-bdea-fbb20f8f37a8)

## Features

### Core Functionality
- **Smart Search** - Real-time movie search with debounced API calls for optimal performance
- **Genre Filtering** - Browse 18+ genres with horizontally scrollable pill navigation
- **Pagination** - Navigate through paginated results with Previous/Next and page numbers
- **Total Count Display** - See the total number of search results in the navbar

### Movie Information
- **Movie Posters** - High-quality poster images with fallback placeholders
- **Duration** - Parsed from ISO 8601 format (e.g., "PT2H2M" → "2h 2m")
- **Rating** - Content rating badges (PG, PG-13, R, etc.)
- **Genres** - Category tags for each movie
- **YouTube Trailers** - One-click access to movie trailers

### User Features
- **Favorites/Watchlist** - Save favorite movies with heart icon
- **User Authentication** - Sign up, login, forgot password, and magic link via Appwrite
- **Cloud Sync** - Logged-in users get their favorites synced across devices
- **Guest Mode** - Browse and save favorites locally without an account

### AI Movie Assistant
- Intelligent chatbot powered by Google Gemini AI
- Natural language understanding for movie recommendations
- Auto-genre detection and filtering

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework with hooks & memoization |
| TypeScript | Type-safe development |
| Vite | Lightning-fast build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router | Client-side routing |
| Appwrite | User authentication & database |
| Gemini AI | Movie recommendation chatbot |

## Project Structure

```
movie-search-app/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AuthModal.tsx       # Login/signup modals
│   │   ├── Chatbot.tsx         # AI assistant interface
│   │   ├── EmptyState.tsx      # No results/error states
│   │   ├── FavoritesHeader.tsx # Favorites page header
│   │   ├── Footer.tsx          # App footer
│   │   ├── GenrePills.tsx      # Genre filter navigation
│   │   ├── LoadingSkeleton.tsx # Loading placeholders
│   │   ├── MovieCard.tsx       # Individual movie card
│   │   ├── MovieGrid.tsx       # Movies grid layout
│   │   ├── MovieModal.tsx      # Movie details modal
│   │   ├── MoviePlaceholder.tsx# Fallback for missing posters
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Pagination.tsx      # Page navigation
│   │   └── index.ts            # Component exports
│   ├── hooks/              # Custom React hooks
│   │   ├── useChatbot.ts       # Chatbot logic
│   │   ├── useFavorites.ts     # Favorites management
│   │   ├── useMovies.ts        # Movie data fetching
│   │   └── index.ts            # Hook exports
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx     # Authentication state
│   ├── lib/                # External service integrations
│   │   └── appwrite.ts         # Appwrite SDK setup
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts            # Type definitions
│   ├── constants/          # App constants
│   │   └── index.ts            # API URLs, genres, etc.
│   ├── utils/              # Utility functions
│   │   └── index.ts            # Helper functions
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # React entry point
├── .env.example            # Environment template
├── index.html              # HTML entry
└── package.json            # Dependencies
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Nishantjain10/movies-explorer.git
cd movies-explorer/movie-search-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file in the `movie-search-app` directory:

```env
# Gemini AI (for chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Appwrite (for authentication)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

### Getting API Keys

| Service | How to Get |
|---------|------------|
| Gemini AI | [Google AI Studio](https://makersuite.google.com/app/apikey) (free) |
| Appwrite | [Appwrite Console](https://cloud.appwrite.io/) (free tier available) |

## AI Movie Assistant Commands

The chatbot (bottom-right corner) understands natural language:

| Command Example | Action |
|-----------------|--------|
| "action", "comedy", "horror" | Filters movies by genre |
| "best movies", "recommend something" | Shows top-rated movies |
| "show all", "reset", "clear" | Clears all filters |
| "I want something scary" | Filters to Horror genre |
| "help" | Shows available commands |

## API Integration

This app integrates with the Movies REST API:

| Endpoint | Description |
|----------|-------------|
| `GET /auth/token` | Fetch authentication token |
| `GET /movies` | List movies (with search, genre, pagination) |
| `GET /movies/{id}` | Get movie details |

**Base URL**: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`

> **Note**: The API does not provide movie descriptions/summaries (the `overview` field is undefined).

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Requirements Checklist

| Requirement | Status |
|-------------|--------|
| Search for movies with paginated results | ✅ |
| Filter search results by genre | ✅ |
| Navigate through pages | ✅ |
| See total count of results | ✅ |
| See movie poster | ✅ |
| See movie duration | ✅ |
| See movie rating | ✅ |
| See movie summary | ⚠️ API limitation |

## License

MIT License - feel free to use this project for learning or building upon it.

---

Built with ❤️ by [Nishant Jain](https://github.com/Nishantjain10)
