# ECHO - Universal Voice Translation App

## Overview
ECHO is a voice translation application that connects African and world languages. It's a fullstack Progressive Web App (PWA) with real-time voice translation capabilities.

## Project Architecture
- **Frontend**: React 18 with TypeScript using Vite as the build tool
- **Backend**: Express.js with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS with Radix UI components
- **Voice**: ElevenLabs for Text-to-Speech (Eleven v3 alpha model) with voice cloning support
- **Translation**: Google Gemini AI for speech-to-text and translation
- **State Management**: React Query (TanStack Query)

## Current State
- ✅ Project successfully imported and configured for Replit
- ✅ Development server running on port 5000
- ✅ Database schema migrated and connected
- ✅ All TypeScript errors resolved
- ✅ Vite configured for Replit proxy (allowedHosts: true)
- ✅ Deployment configuration set up for autoscale

## Key Features
- Voice translation between multiple languages including African languages (Yoruba, Swahili, Amharic, etc.)
- User authentication and profile management
- Translation history and saved translations
- Daily usage limits with tracking
- PWA capabilities with offline support
- Responsive design for mobile and desktop
- Real-time feedback system

## Recent Changes (December 18, 2025)
- Integrated ElevenLabs for text-to-speech using Eleven v3 (alpha) model
- Added instant voice cloning capability with authenticated, rate-limited endpoint
- Updated voice mapping to use ElevenLabs voice IDs
- Maintained Gemini as fallback for TTS if ElevenLabs fails
- Voice cloning endpoint protected with authentication and rate limiting (3/hour)

## Previous Changes (September 24, 2025)
- Fixed server port from 5500 to 5000 for Replit compatibility
- Added allowedHosts: true to Vite config for proxy support
- Configured PostgreSQL database with Drizzle ORM
- Set up development workflow on port 5000
- Configured autoscale deployment for production

## Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/          # Express.js backend
│   ├── services/    # Business logic (speech, translation)
│   └── routes.ts    # API route definitions
├── shared/          # Shared types and schemas
└── migrations/      # Database migrations
```

## Environment Variables Required
- `GEMINI_API_KEY`: Google Gemini AI API key for translation and speech-to-text
- `ELEVENLABS_API_KEY`: ElevenLabs API key for text-to-speech (using Eleven v3 alpha model) and voice cloning
- `SESSION_SECRET`: Secret for session management
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)

## Database Schema
- `users`: User profiles and authentication
- `translations`: Translation history and data
- `daily_usage`: Usage tracking for rate limiting
- `feedback`: User feedback and ratings
- `sessions`: Session storage for authentication

## Development
- Run `npm run dev` to start development server
- Run `npm run db:push` to sync database schema changes
- Frontend serves on 0.0.0.0:5000 with backend API on same port

## Deployment
- Configured for Replit autoscale deployment
- Build command: `npm run build`
- Start command: `npm start`
- Automatically handles static file serving and API routing