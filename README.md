# Movie Explorer

A modern movie discovery application built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme UI with smooth animations and an intuitive browsing experience.

![Movie Explorer Screenshot](https://github.com/user-attachments/assets/d653052c-5129-4f48-bdea-fbb20f8f37a8)

## Features

- **Smart Search**: Real-time movie search with debounced API calls for optimal performance
- **Genre Filtering**: Browse 18+ genres with a horizontally scrollable pill navigation
- **Favorites/Watchlist**: Save your favorite movies (persisted locally)
- **Movie Details**: Rich modal view with poster, rating, runtime, overview, and trailer links
- **YouTube Integration**: One-click access to movie trailers
- **AI Movie Assistant**: Intelligent chatbot for personalized recommendations
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile
- **Modern UI**: Glassmorphism effects, dark theme, smooth hover animations

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework with hooks & memoization |
| TypeScript | Type-safe development |
| Vite | Lightning-fast build tool |
| Tailwind CSS v4 | Utility-first styling |
| Gemini AI | Movie recommendation chatbot |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Nishantjain10/movies-explorer.git
cd movies-explorer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Environment Setup

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

## AI Movie Assistant

The chatbot (bottom-right corner) understands natural language:

| Command | Action |
|---------|--------|
| "action", "comedy", "drama" | Filters by genre |
| "best movies", "suggest something" | Shows recommendations |
| "show all", "reset" | Clears all filters |
| "I want something scary" | Filters to Horror |

## Project Structure

```
movie-search-app/
├── src/
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles & Tailwind
│   └── main.tsx         # React entry point
├── .env.example         # Environment template
├── index.html           # HTML entry
└── package.json         # Dependencies
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

This app integrates with a Movies REST API:
- **Base URL**: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`
- **Authentication**: Bearer token (auto-fetched on startup)
- **Endpoints**: `/auth/token`, `/movies`, `/movies/{id}`

## Highlights

### What Makes This Project Special
- Intuitive genre filtering with horizontal scroll navigation
- AI-powered chatbot that understands natural language queries
- Progressive loading with skeleton states for better UX
- Robust error handling for broken images and API failures

### Future Roadmap
- [ ] Infinite scroll pagination
- [ ] User authentication with cloud-synced favorites
- [ ] Unit and integration tests
- [ ] Movie recommendations based on watch history

## License

MIT License - feel free to use this project for learning or building upon it.

---

Built with ❤️ by [Nishant Jain](https://github.com/Nishantjain10)
