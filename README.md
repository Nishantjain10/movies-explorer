# Movie Explorer

A modern movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations, user authentication, and an intelligent AI chatbot for personalized recommendations.

![Movie Explorer Screenshot](https://github.com/user-attachments/assets/d653052c-5129-4f48-bdea-fbb20f8f37a8)

## Live Demo

**Deployed Application**: [https://movies-explorer-nu.vercel.app/](https://movies-explorer-nu.vercel.app/)

---

## Highlights & Reflection

### What I Found Especially Interesting

The **landing page poster validation system** was a particularly interesting challenge. When a user lands on the app for the first time (page 1, no filters, no search), I wanted to ensure they see a polished grid of movies with working poster images - not broken image placeholders. The API returns poster URLs, but many return 404 errors.

**Solution for first-time user experience:**

1. **Fetch extra movies** - Request 30 movies instead of 15 to have a larger pool
2. **Quick URL pattern check** - Filter out obviously invalid URLs (placeholders, etc.)
3. **Parallel image preloading** - Use JavaScript `Image` objects to test if posters actually load
4. **Timeout mechanism** - 1.5 second timeout per image to prevent slow images from blocking the UI
5. **Caching layer** - Store validation results to avoid re-checking the same URLs
6. **Display filtered results** - Show only the first 15 movies with confirmed working posters

This validation only runs on the **landing page** (first page, "All" genre, no search). For subsequent pages, genre filtering, or search results, the regular skeleton loading is used for faster response times. This approach balances first-impression polish with overall performance.

### What I'm Most Proud Of

I'm most proud of the **overall user experience and polish** of the application:

- **Progressive loading with rotating messages** - Instead of a boring spinner, the landing page shows engaging messages like "Discovering amazing movies for you..." while loading
- **Authentication flow powered by Appwrite** - Users can browse as guests, save favorites locally, then sync them to the cloud when they sign up
- **AI chatbot integration** - Natural language understanding for movie recommendations with genre auto-detection
- **Responsive design** - Carefully crafted UI that works beautifully from mobile to desktop
- **Modular architecture** - Clean separation of concerns with custom hooks, components, and utilities

### Future Improvements (Given More Time)

1. **Voice Chat Functionality** - Implement speech-to-text for the AI chatbot, allowing users to ask for movie recommendations using voice commands. Would use the Web Speech API for voice input and text-to-speech for AI responses.

2. **Infinite Scroll** - Replace pagination with infinite scroll for a more modern, app-like experience. Would use Intersection Observer API for efficient detection.

3. **Advanced Filtering** - Add filters for release year range, rating threshold, and runtime. The current API limitations prevented this, but a client-side filtering layer could be added.

4. **Offline Support** - Implement a Service Worker with caching strategies to allow browsing cached movies without an internet connection.

5. **Social Features** - Add ability to share favorite lists with friends via unique URLs, and see what movies are trending among users.

---

## Features

### Core Functionality (Requirements Met)
- **Smart Search** - Real-time movie search with debounced API calls for optimal performance
- **Genre Filtering** - Browse 18+ genres with horizontally scrollable pill navigation
- **Pagination** - Navigate through paginated results with Previous/Next and page numbers
- **Total Count Display** - See the total number of search results in navbar and pagination area

### Movie Information
- **Movie Posters** - High-quality poster images with validated loading and fallback placeholders
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

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI framework with hooks & memoization |
| TypeScript | 5.7.2 | Type-safe development |
| Vite | 6.2.0 | Lightning-fast build tool |
| Tailwind CSS | 4.x | Utility-first styling |
| React Router DOM | 7.x | Client-side routing |
| Appwrite | 17.x | User authentication & database |
| Google Generative AI | 0.24.x | Movie recommendation chatbot |

---

## Project Structure

```
movie-search-app/
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AuthModal.tsx           # Login/signup modals with animations
│   │   ├── Chatbot.tsx             # AI assistant interface
│   │   ├── EmptyState.tsx          # No results/error states
│   │   ├── FavoritesHeader.tsx     # Favorites page header with sync banner
│   │   ├── Footer.tsx              # App footer
│   │   ├── GenrePills.tsx          # Horizontally scrollable genre filters
│   │   ├── LoadingSkeleton.tsx     # Loading states (landing page + skeleton)
│   │   ├── MovieCard.tsx           # Individual movie card with hover effects
│   │   ├── MovieGrid.tsx           # Responsive movies grid layout
│   │   ├── MovieModal.tsx          # Movie details modal with trailer link
│   │   ├── MoviePlaceholder.tsx    # Themed fallback for missing posters
│   │   ├── Navbar.tsx              # Top navigation with search & auth
│   │   ├── Pagination.tsx          # Page navigation with total count
│   │   └── index.ts                # Barrel exports for all components
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChatbot.ts           # AI chatbot state & logic
│   │   ├── useFavorites.ts         # Favorites management (local + cloud)
│   │   ├── useMovies.ts            # Movie fetching, caching, poster validation
│   │   └── index.ts                # Hook exports
│   │
│   ├── context/                # React Context providers
│   │   └── AuthContext.tsx         # Authentication state & Appwrite integration
│   │
│   ├── lib/                    # External service integrations
│   │   └── appwrite.ts             # Appwrite SDK setup & favorites API
│   │
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts                # Movie, User, Favorite type definitions
│   │
│   ├── constants/              # App constants
│   │   └── index.ts                # API URLs, genre list, config
│   │
│   ├── utils/                  # Utility functions
│   │   └── index.ts                # Duration parser, formatters, cache
│   │
│   ├── App.tsx                 # Main app component with routing
│   ├── index.css               # Global styles & Tailwind imports
│   └── main.tsx                # React entry point with providers
│
├── public/                     # Static assets
├── .env.example                # Environment template
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # This file
```

---

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

---

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

---

## AI Movie Assistant Commands

The chatbot (bottom-right corner) understands natural language:

| Command Example | Action |
|-----------------|--------|
| "action", "comedy", "horror" | Filters movies by genre |
| "best movies", "recommend something" | Shows top-rated movies |
| "show all", "reset", "clear" | Clears all filters |
| "I want something scary" | Filters to Horror genre |
| "help" | Shows available commands |

---

## API Integration

This app integrates with the Movies REST API:

| Endpoint | Description |
|----------|-------------|
| `GET /auth/token` | Fetch authentication token |
| `GET /movies` | List movies (with search, genre, pagination) |
| `GET /movies/{id}` | Get movie details |

**Base URL**: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`

> **Note**: The API does not provide movie descriptions/summaries (the `overview` field is undefined).

---

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

---

## Third-Party Libraries

| Library | Purpose |
|---------|---------|
| `react` & `react-dom` | Core UI framework |
| `react-router-dom` | Client-side routing for favorites page |
| `appwrite` | User authentication and cloud database |
| `@google/generative-ai` | Gemini AI for chatbot functionality |
| `tailwindcss` & `@tailwindcss/vite` | Utility-first CSS framework |
| `typescript` | Type safety and better DX |
| `vite` | Fast development server and build tool |

---

Built with ❤️ by [Nishant Jain](https://github.com/Nishantjain10)
