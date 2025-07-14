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

## Deployment Status

**Current Status**: ✅ **LIVE AND WORKING** - Deployed to Vercel at https://deposition-app.vercel.app

### Master Account Configuration
- **Master Account Email**: `ddk@karplawfirm.com`
- **Access Level**: Unlimited credits (999,999), bypasses subscription checks
- **Dashboard Access**: Full access to all features without billing requirements

### Latest Fixes Applied (July 2024)
1. **✅ Fixed 404 Errors**: All dashboard routes now work properly
2. **✅ Fixed Subscription Status**: Master accounts show unlimited access with purple badge
3. **✅ Fixed Navigation**: All sidebar links work without errors
4. **✅ Fixed React Router v7 API**: Updated from `json()` to `data()` in loaders
5. **✅ Fixed TypeScript Errors**: Resolved build-breaking type issues
6. **✅ Added Missing Routes**: Created reports and team management pages

### Working Dashboard Routes
- `/dashboard` - Main dashboard with analytics
- `/dashboard/upload` - Document upload interface (placeholder)
- `/dashboard/documents` - Document management interface
- `/dashboard/reports` - Analytics and reporting page
- `/dashboard/chat` - AI chat interface (working)
- `/dashboard/settings` - Subscription status (shows master account badge)
- `/dashboard/team` - Team management page

## Architecture Overview

### Route Structure (React Router v7)
- Uses file-based routing with `app/routes.ts` configuration
- Key routes: `/` (homepage), `/dashboard/*` (protected), `/pricing`, `/sign-in`, `/sign-up`
- Protected routes require authentication + active subscription
- Dashboard has nested layout with sidebar navigation
- **IMPORTANT**: Use `data()` not `json()` for returning data from loaders

### Authentication Flow
- **Clerk** handles authentication with token-based identity
- Users are synced to Convex database via `convex/users.ts`
- Dashboard layout (`app/routes/dashboard/layout.tsx`) enforces auth + subscription checks
- Authentication state managed server-side with loaders
- **Master accounts bypass subscription checks** in layout.tsx

### Subscription System
- **Polar.sh** integration for billing and payments
- Subscription status checked via `convex/subscriptions.ts`
- Webhook handling at `/payments/webhook` for payment events
- Users redirected to `/subscription-required` if no active subscription
- **Master accounts get unlimited access** without subscription validation

### Database Schema (Convex)
- **users**: User profiles synced from Clerk
- **subscriptions**: Polar.sh subscription data with status tracking
- **webhookEvents**: Payment webhook event logging
- **documents**: Document uploads and processing status
- **firms**: Firm management with credit system
- **objections**: AI-detected objections from transcripts
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
- Query functions for data fetching (e.g., `getDocuments`, `getDocumentStats`)
- Mutation functions for data updates (e.g., `createDocument`, `updateDocumentStatus`)
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
- **Production URL**: https://deposition-app.vercel.app

## Development Patterns

### Data Loading
- Use React Router loaders for server-side data fetching
- Convex queries for real-time client-side data
- Parallel data fetching to avoid waterfalls
- **IMPORTANT**: Always use `data()` instead of `json()` for React Router v7

### Protected Routes
- All dashboard routes require authentication + subscription
- Redirect patterns handled in route loaders
- Subscription status checked on every protected route access
- **Master accounts bypass all subscription checks**

### Error Handling
- Route-level error boundaries
- Webhook validation and error logging
- Graceful fallbacks for missing data
- Fixed favicon.ico 404 errors

## Testing & Quality

Before committing changes:
1. Run `npm run typecheck` to verify TypeScript
2. Test authentication flows (sign-in/sign-up)
3. Verify subscription status checks work properly
4. Test AI chat functionality if modified
5. Ensure webhook endpoints handle errors gracefully
6. **Test all dashboard routes work without 404 errors**

## Known Issues Resolved

### Previous Issues (ALL FIXED)
1. ~~404 errors on dashboard routes~~ ✅ **FIXED** - All routes now work
2. ~~Subscription status showing "Sign in" for master accounts~~ ✅ **FIXED** - Shows unlimited access
3. ~~React Router v7 API compatibility~~ ✅ **FIXED** - Updated to use `data()`
4. ~~TypeScript compilation errors~~ ✅ **FIXED** - Resolved all type issues
5. ~~Missing route files~~ ✅ **FIXED** - Created all missing dashboard routes
6. ~~Favicon.ico 404 errors~~ ✅ **FIXED** - Added proper favicon handling

### Future Development
- Document upload functionality (placeholder implemented)
- AI objection detection integration
- Real-time document processing
- Advanced reporting and analytics
- Team management features
- Export functionality (CSV, PDF reports)

## Git Repository
- **GitHub**: https://github.com/ddkarolczak/react-starter-kit
- **Vercel**: Automatic deployment on push to main branch
- **Secrets**: Properly configured in Vercel environment variables

## Continue Session Notes
Yes, you can use the `--continue` command to pick up where we left off. The application is now fully functional with all dashboard routes working properly. The next major development phase would likely involve implementing the actual document upload and AI processing functionality.