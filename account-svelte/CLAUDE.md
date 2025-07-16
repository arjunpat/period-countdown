# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application serving as the account/settings frontend for the periods.io system. The app handles user authentication, school selection, period customization, and settings management for a period countdown application. It's configured as a static site for deployment.

## Development Commands

- `npm run dev` - Start development server on port 8082
- `npm run build` - Build for production (static site)
- `npm run preview` - Preview production build on port 8082
- `npm run check` - Run TypeScript and Svelte checks
- `npm run check:watch` - Run checks in watch mode
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with Prettier

## Architecture

### Core Components

- **API Layer** (`src/lib/api.ts`): Handles all HTTP requests to backend API with automatic environment detection (localhost:8081 for dev, api.periods.io for prod)
- **State Management** (`src/lib/store.ts`): Svelte stores for user data, settings, and application state
- **Settings Components** (`src/lib/components/settings/`): Modular components for different settings sections

### Backend Integration

- Communicates with API server on port 8081 (dev) or api.periods.io (prod)
- Uses cookie-based authentication with `credentials: 'include'`
- Supports Google OAuth flow with access token handling
- Performance monitoring with request timing logs

### Key Features

- User authentication and OAuth handling
- School selection and period management
- Custom period names and meeting links
- Theme selection
- Settings persistence to backend API
- Admin navigation for privileged users

### Data Flow

1. OAuth redirect handling in layout component
2. User data loaded via `/v4/account` endpoint
3. Settings managed through reactive Svelte stores
4. Changes saved via `/v4/update-preferences` endpoint
5. Real-time UI updates through store subscriptions

## Technical Stack

- **Framework**: SvelteKit 2.x with Svelte 5.x
- **Language**: TypeScript with strict mode
- **Build**: Vite 7.x with static adapter
- **Styling**: Component-scoped CSS
- **Linting**: ESLint 9.x with TypeScript and Svelte plugins
- **Formatting**: Prettier with Svelte plugin

## Configuration Notes

- Uses static adapter for deployment as a static site
- Prerendering enabled by default
- Fallback to index.html for SPA behavior
- TypeScript strict mode with bundler module resolution
- ESLint configured with recommended rules for TypeScript and Svelte
