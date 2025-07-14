# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Deposition Objection Automation** tool - a specialized legal SaaS application that helps attorneys automatically detect and analyze objections in deposition transcripts. Built with:
- **React Router v7** (full-stack React framework with SSR)
- **Convex** (real-time database and serverless functions)
- **Clerk** (authentication and user management)
- **Polar.sh** (subscription billing and payments)
- **TailwindCSS v4** (utility-first CSS framework)
- **shadcn/ui** (component library with Radix UI)
- **OpenAI** (AI chat capabilities)

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run TypeScript checks
npm run typecheck

# Initialize/run Convex database
npx convex dev
```

## Architecture Overview

### Route Structure (React Router v7)
- Uses file-based routing with `app/routes.ts` configuration
- Key routes: `/` (homepage), `/dashboard/*` (protected), `/pricing`, `/sign-in`, `/sign-up`
- Protected routes require authentication and active subscription
- Dashboard has nested layout with sidebar navigation

### Authentication Flow
- **Clerk** handles authentication with token-based identity
- Users are synced to Convex database via `convex/users.ts`
- Dashboard layout (`app/routes/dashboard/layout.tsx`) enforces auth + subscription checks
- Authentication state managed server-side with loaders

### Subscription System
- **Polar.sh** integration for billing and payments
- Subscription status checked via `convex/subscriptions.ts`
- Webhook handling at `/payments/webhook` for payment events
- Users redirected to `/subscription-required` if no active subscription

### Database Schema (Convex)
- **users**: User profiles synced from Clerk
- **subscriptions**: Polar.sh subscription data with status tracking
- **webhookEvents**: Payment webhook event logging
- All tables use appropriate indexes for performance

### AI Chat System
- OpenAI integration via Convex HTTP actions (`convex/http.ts`)
- Streaming responses with CORS handling
- Chat endpoint: `/api/chat` (POST)
- Real-time message streaming in dashboard

### Component Architecture
- **shadcn/ui** components in `app/components/ui/`
- Dashboard-specific components in `app/components/dashboard/`
- Homepage sections in `app/components/homepage/`
- Follows React 19 patterns with modern hooks

## Key Integration Points

### Convex Functions
- Query functions for data fetching (e.g., `findUserByToken`)
- Mutation functions for data updates (e.g., `upsertUser`)
- HTTP actions for webhooks and API endpoints
- Real-time subscriptions for live data updates

### Environment Variables
Essential for development:
- `VITE_CONVEX_URL` / `CONVEX_DEPLOYMENT` (Convex)
- `VITE_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` (Clerk)
- `POLAR_*` variables (Polar.sh billing)
- `OPENAI_API_KEY` (AI chat)
- `FRONTEND_URL` (CORS/redirects)

### Deployment
- Optimized for **Vercel** with `@vercel/react-router` preset
- SSR enabled by default in `react-router.config.ts`
- Docker support available for alternative deployment
- Requires all environment variables configured in deployment platform

## Development Patterns

### Data Loading
- Use React Router loaders for server-side data fetching
- Convex queries for real-time client-side data
- Parallel data fetching to avoid waterfalls

### Protected Routes
- All dashboard routes require authentication + subscription
- Redirect patterns handled in route loaders
- Subscription status checked on every protected route access

### Error Handling
- Route-level error boundaries
- Webhook validation and error logging
- Graceful fallbacks for missing data

## Testing & Quality

Before committing changes:
1. Run `npm run typecheck` to verify TypeScript
2. Test authentication flows (sign-in/sign-up)
3. Verify subscription status checks work properly
4. Test AI chat functionality if modified
5. Ensure webhook endpoints handle errors gracefully