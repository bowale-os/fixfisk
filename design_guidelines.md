# Fisk University Campus Feedback Platform - Premium Design Guidelines

## Design Approach
**Reference-Based Premium**: Drawing from Linear's precision and speed, Reddit's modern card-based engagement, and Apple's refinement. Focus on glassmorphic depth, generous whitespace, bold hierarchy, and delightful micro-interactions that make the platform feel like a premium product.

## Color System
**Fisk University Brand**:
- Primary Blue: Rich, deep blue for primary actions, headers, active states
- Gold Accent: Warm gold for highlights, badges, success states, upvote indicators
- Supporting: Deep navy backgrounds, soft cream for elevated surfaces
- System: Use alpha channels for glassmorphic overlays (bg-white/10, bg-blue/20)

## Typography System

**Font Families**:
- Primary: Inter (Google Fonts, weights: 400, 500, 600, 700, 800)
- Display: Inter with tighter tracking for hero elements

**Type Scale** (Bold hierarchy):
- Hero/Feature Headers: text-5xl md:text-6xl, font-bold, tracking-tight
- Post Titles: text-2xl md:text-3xl, font-bold
- Section Headers: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, font-normal, leading-relaxed
- Meta/Labels: text-sm, font-medium
- Tags: text-xs, font-semibold, uppercase, tracking-wider

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-6, p-8, p-12 (generous)
- Section spacing: space-y-12, space-y-16, space-y-20
- Card gaps: gap-6, gap-8
- Container breathing room: py-16, py-20, py-24

**Container Strategy**:
- Main feed: max-w-5xl mx-auto (spacious)
- Post detail: max-w-4xl
- Mobile: px-6, Desktop: px-8
- Full-width sections with inner max-w-7xl for hero areas

## Core Component Library

### Glassmorphic Navigation Header
- Fixed, full-width with frosted glass effect (backdrop-blur-xl, bg-white/80 or bg-navy/80)
- Height: h-20 md:h-24
- Inner container: max-w-7xl, flex items-center justify-between, px-8
- Left: Fisk wordmark (larger, prominent)
- Center: Expanded search with icon, rounded-full, generous padding (px-6 py-3, w-full max-w-xl)
- Right: Notification bell with animated badge + large avatar (h-10 w-10)
- Subtle border-b with alpha channel
- Mobile: Simplified with hamburger, search icon modal

### Premium Post Card
- Elevated glassmorphic card: backdrop-blur-lg, bg-white/60 or bg-cream/40, border with alpha
- Generous padding: p-8 md:p-10
- Rounded corners: rounded-2xl
- Subtle shadow: shadow-xl
- Layout:
  - Left sidebar (w-16 md:w-20): Large upvote button vertical (icon h-8 w-8, bold count below)
  - Main content (flex-1, space-y-4):
    - Meta row: Avatar + username/anonymous + timestamp + tag pills
    - Title: text-2xl md:text-3xl font-bold, no line clamp (show full)
    - Description: text-lg leading-relaxed, line-clamp-4
    - Image preview: h-48 md:h-64, rounded-xl, full-width
    - Footer: Comment count (with icon), status badge (pill shape), admin dropdown
- Spacing between cards: mb-8 md:mb-12

### Post Detail Hero
- Full-width header section with gradient overlay
- Large title: text-4xl md:text-5xl font-bold
- Spacious meta information row
- Featured image: Full-width, max-h-[500px], object-cover
- Floating upvote button (glassmorphic, positioned absolute left)

### Premium Comment Thread
- Each comment: glassmorphic card, p-6, rounded-xl, mb-6
- Nesting: Left accent bar (w-1, gradient blue-to-gold), pl-8 per level
- Mini upvote: Horizontal layout, gold when active
- Generous line height for readability
- Reply/Edit buttons as text links with hover states
- Max nesting: 4 levels desktop, 2 levels mobile

### Floating Action Button
- Large, prominent "New Post" FAB (fixed bottom-right on desktop, bottom center on mobile)
- Size: h-16 w-16 rounded-full
- Glassmorphic with blue background, gold accent on hover
- Shadow-2xl, scale animation on hover

### Filter Bar
- Glassmorphic sticky bar below header
- Horizontal scroll of filter chips: rounded-full, px-6 py-3, generous tap targets
- Active state: blue background, gold border
- Sort dropdown: Large, prominent
- Height: h-16, generous spacing between elements

### Submit Modal
- Large centered modal: max-w-3xl, max-h-[90vh]
- Glassmorphic backdrop: backdrop-blur-2xl
- Inner card: p-12, space-y-8
- Generous form fields: Input heights h-14, textarea h-48
- Image dropzone: h-64, dashed border, prominent icon and CTA
- Action buttons: Full-width on mobile, inline on desktop (h-12, px-8)

### Notification Panel
- Slide-in from right: w-full md:w-[480px]
- Glassmorphic surface
- Each notification: p-6, generous spacing
- Large icons (h-12 w-12) with blue/gold colors
- Unread: Subtle gold accent border

### Tag Pills
- Large, tappable: px-4 py-2, rounded-full
- Blue/gold color coding by category
- Bold uppercase text
- Animated hover/active states

### Status Badges
- Prominent pill shape: px-4 py-2, rounded-full
- Gold for completed, blue for in-progress
- Bold text, icon included

## Glassmorphic Effects
- Headers/Navigation: backdrop-blur-xl, bg-white/80
- Cards: backdrop-blur-lg, bg-white/60 or bg-cream/40
- Modals: backdrop-blur-2xl on overlay, bg-white/90 on content
- Floating elements: backdrop-blur-md with subtle borders (border-white/20)
- All glass elements: Subtle border with alpha channel for definition

## Micro-Interactions
- Upvote: Scale transform (scale-110), color shift to gold, spring animation (duration-300)
- Card hover: Subtle lift (translate-y-[-4px]), enhanced shadow (duration-200)
- Button press: Scale down (scale-95), immediate feedback
- Status change: Fade in new badge, confetti animation for "Completed"
- Notification badge: Gentle pulse, scale animation on new item
- Image loading: Skeleton with shimmer effect
- FAB: Rotate icon on hover, scale on click

## Images
**Hero Section**: None - platform opens directly to feed for immediacy
**Post Cards**: User-uploaded images, full-width within card, rounded-xl, aspect-ratio preserved, max-h-64
**Empty States**: Illustration graphics (using heroicons composed into scenes), centered, large scale (h-48 w-48)
**Profile Avatars**: Circular, multiple sizes (h-8 w-8 for meta, h-10 w-10 for nav, h-12 w-12 for detail)
**Tag Icons**: Small decorative icons next to category tags (h-4 w-4)

## Mobile Responsive Strategy

**Mobile-First Adaptations**:
- Single column layouts, full-width cards
- Upvote moves to card footer (horizontal)
- Navigation: Bottom tab bar with large touch targets (h-16)
- Filters: Full-screen modal overlay instead of bar
- Generous touch targets: minimum h-12
- FAB: Centered bottom, larger (h-14 w-14)
- Comments: Stack replies with subtle indentation
- Typography scales down one size (text-xl becomes text-lg)
- Padding adjusts: p-8 becomes p-6
- Modal: Full-screen on mobile

**Breakpoints**: 
- Mobile: base to md (< 768px)
- Desktop: lg+ (≥ 1024px)