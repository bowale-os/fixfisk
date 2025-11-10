# Fisk University Campus Feedback Platform

## Overview

The Fisk University Campus Feedback Platform is a web application designed to facilitate communication between students and the Student Government Association (SGA). Students can submit feedback, suggestions, and concerns about campus life, while SGA administrators can review, respond to, and track the status of these submissions. The platform features a Reddit-inspired card-based interface with voting, commenting, and status tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with shadcn/ui component library
- **Styling:** Tailwind CSS with custom design system

**Design Philosophy:**
The frontend follows a premium design approach inspired by Linear's precision, Reddit's card-based engagement, and Apple's refinement. The design emphasizes glassmorphic effects, generous whitespace, and bold typography hierarchy. The color system centers around Fisk University's brand colors (primary blue and gold accents) with a sophisticated use of alpha channels for depth.

**Component Structure:**
- Reusable UI components in `client/src/components/ui/` (shadcn/ui library)
- Feature components in `client/src/components/` (Header, FilterBar, PostCard, CreatePostDialog, etc.)
- Pages in `client/src/pages/` with route-based code splitting
- Custom hooks in `client/src/hooks/` for authentication and UI utilities

**Key Architectural Decisions:**
- **Component Library Choice:** Radix UI primitives provide unstyled, accessible components that are styled with Tailwind CSS using the shadcn/ui pattern. This allows for full design control while maintaining accessibility standards.
- **State Management:** TanStack Query handles all server state, eliminating the need for a global state management library like Redux. This simplifies data fetching, caching, and synchronization.
- **Styling Approach:** Utility-first CSS with Tailwind provides rapid development and consistent design tokens defined in the theme configuration.

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless)
- **Session Management:** express-session with in-memory store (scalable to PostgreSQL with connect-pg-simple)
- **Authentication:** Magic link authentication via Supabase Auth

**API Design:**
RESTful API endpoints organized in `server/routes.ts`:
- Authentication endpoints (`/api/auth/*`)
- Post management (`/api/posts`, `/api/posts/:id`)
- Comment operations (`/api/posts/:id/comments`)
- Vote management (`/api/posts/:id/vote`, `/api/comments/:id/vote`)
- Notification endpoints (`/api/notifications`)
- Admin-only endpoints for status updates

**Key Architectural Decisions:**
- **Authentication Strategy:** Magic link authentication eliminates password management complexity and provides a secure, user-friendly experience. Email addresses are restricted to `@my.fisk.edu` domain to ensure only Fisk students can access the platform.
- **Session Management:** Server-side sessions with HTTP-only cookies provide secure authentication state management. Sessions are configured with a 7-day expiration.
- **Middleware Architecture:** Custom middleware for authentication (`requireAuth`) and authorization (`requireSGAAdmin`) ensures proper access control across protected endpoints.
- **Data Access Layer:** The storage interface (`IStorage` in `server/storage.ts`) abstracts database operations, providing a clean separation between business logic and data persistence. This pattern makes it easy to swap database implementations if needed.

### Database Schema

**Core Tables:**
- **users:** Stores user accounts with email (restricted to @my.fisk.edu) and admin status
- **posts:** Contains student feedback submissions with title, content, tags, anonymous flag, status, and vote/comment counts
- **comments:** Threaded comments on posts with support for anonymous posting
- **votes:** Tracks upvotes on posts and comments (one vote per user per item)
- **notifications:** User notifications for status updates, comments, and milestones
- **magicLinkTokens:** Temporary tokens for passwordless authentication

**Design Decisions:**
- **Denormalized Counts:** Post upvote and comment counts are stored directly on the posts table for performance. These are updated transactionally when votes/comments are added or removed.
- **Status Workflow:** Posts progress through states: pending → reviewing → in_progress → completed (or wont_fix). Only SGA admins can update status.
- **Anonymous Posting:** Posts and comments can be marked anonymous, allowing students to provide feedback without identification concerns.
- **Indexing Strategy:** Indexes on frequently queried fields (userId, createdAt, status, tags) optimize common query patterns like filtering and sorting.

### Authentication Flow

**Magic Link Implementation:**
1. User enters their @my.fisk.edu email address
2. System validates email domain and sends magic link via Supabase Auth
3. User clicks link, which contains a one-time token
4. Backend verifies token with Supabase Admin client
5. Session is created and user is logged in
6. Token is invalidated after use or expiration

**Security Considerations:**
- Email domain validation ensures only Fisk students can register
- Tokens expire after a configurable time period
- Sessions use HTTP-only cookies to prevent XSS attacks
- SGA admin status is stored in the database, not in JWT claims, preventing privilege escalation

## External Dependencies

### Third-Party Services

**Supabase:**
- **Purpose:** Passwordless authentication via magic links
- **Integration:** Two clients are configured - `supabaseAnon` for sending magic links and `supabaseAdmin` for server-side token verification
- **Environment Variables Required:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Rationale:** Supabase provides a managed authentication service that handles email delivery and token management, reducing infrastructure complexity

**Neon Database:**
- **Purpose:** Serverless PostgreSQL database hosting
- **Integration:** Connected via `@neondatabase/serverless` package with WebSocket support
- **Environment Variables Required:** `DATABASE_URL`
- **Rationale:** Neon's serverless architecture provides automatic scaling and edge deployment capabilities suitable for a campus-scale application

**Resend (Email Service):**
- **Purpose:** Email delivery for notifications and potentially magic links
- **Integration:** Optional dependency for transactional email
- **Note:** Currently configured but implementation may use Supabase's built-in email service instead

### Development Dependencies

**Build Tools:**
- **Vite:** Frontend build tool and dev server with HMR
- **esbuild:** Backend bundler for production builds
- **TypeScript:** Type safety across the entire stack
- **Drizzle Kit:** Database schema migrations and management

**Replit-Specific Tooling:**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Development mode file navigation
- `@replit/vite-plugin-dev-banner`: Development environment indicator

### UI Component Libraries

**Radix UI:**
Extensive collection of unstyled, accessible component primitives including:
- Dialog, Dropdown, Popover for overlays
- Select, Checkbox, Radio for form controls
- Toast for notifications
- Avatar, Badge, Button for common UI elements

**Additional UI Libraries:**
- `cmdk`: Command palette component
- `react-day-picker`: Calendar/date picker
- `vaul`: Drawer component for mobile
- `embla-carousel-react`: Carousel functionality

### Utility Libraries

- **date-fns:** Date formatting and manipulation
- **zod:** Runtime type validation and schema definition
- **class-variance-authority & clsx:** Dynamic className composition
- **tailwind-merge:** Intelligent Tailwind class merging
- **nanoid:** Unique ID generation