# Fisk University Campus Feedback Platform - Design Guidelines

## Design Approach
**Reference-Based with System Principles**: Drawing inspiration from Linear's clean issue tracking, Reddit's community engagement patterns, and GitHub's discussion interfaces. Focus on scannable content, clear hierarchy, and efficient interaction patterns suitable for a university community platform.

## Typography System

**Font Families**:
- Primary: Inter (Google Fonts) - for UI elements, buttons, labels
- Secondary: System UI fonts - for body text and comments

**Type Scale**:
- Hero/Empty States: text-4xl, font-bold
- Post Titles: text-xl, font-semibold
- Section Headers: text-lg, font-semibold
- Body Text: text-base, font-normal
- Meta Information: text-sm, font-normal
- Tags/Labels: text-xs, font-medium, uppercase tracking-wide
- Buttons: text-sm, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Margins: m-4, m-8, m-12

**Container Strategy**:
- Main content: max-w-4xl mx-auto (optimal reading width for posts)
- Wide layout option: max-w-6xl for list views with sidebars
- Mobile: px-4, Desktop: px-6

## Core Component Library

### Navigation Header
- Fixed top navigation with max-w-7xl container
- Logo (Fisk University wordmark) aligned left
- Center: Search bar with icon (w-full max-w-md)
- Right: Notification bell icon with badge counter + user avatar dropdown
- Height: h-16, border-b
- Mobile: Hamburger menu, search icon only

### Post Card (Main Feed)
- Full-width cards with subtle border, rounded-lg
- Compact layout: 
  - Left column (w-12): Upvote button (vertical, icon + count stacked)
  - Main content area: flex-1
    - Header row: Anonymous/Username + timestamp + tag badges
    - Title: text-xl font-semibold, line-clamp-2
    - Description preview: text-base, line-clamp-3
    - Thumbnail if image attached (h-32 w-48 object-cover rounded)
    - Footer: Comment count, status badge (if SGA updated), inline admin dropdown (SGA only)
- Spacing: p-4 inner padding, mb-4 between cards

### Post Detail View
- Two-column desktop layout (sidebar + main)
- Left sidebar (w-20): Centered upvote section (icon, count, visual feedback)
- Main content (flex-1):
  - Full title + full description
  - Full-size image if attached (max-h-96, rounded-lg)
  - Tags row
  - Status badge (if set by SGA)
  - SGA inline status dropdown (admins only)
  - Metadata row: author, timestamp, view count

### Comment Thread
- Nested structure with left border indicators for depth
- Each comment: pl-4 per nesting level (max 3 levels)
- Comment card: p-4, rounded, border
  - Mini upvote (horizontal: icon + count)
  - Author + timestamp + anonymous badge
  - Comment text
  - Reply button + Edit/Delete (if own comment)
- Spacing: space-y-4 between top-level comments

### Filter/Sort Bar
- Sticky below header on scroll
- Horizontal layout: 
  - Sort dropdown (Most Recent, Most Upvoted, Trending)
  - Tag filter chips (scrollable horizontal)
  - SGA Status filter toggle
- Height: h-12, border-b

### Submit/Create Post Modal
- Centered modal overlay (max-w-2xl)
- Form fields vertically stacked (space-y-4):
  - Title input (full width)
  - Description textarea (h-40)
  - Image upload dropzone (border-dashed, h-32, centered icon + text)
  - Tag selection (multi-select dropdown or chip selector)
  - Anonymous toggle checkbox
- Action buttons row: Cancel + Submit Post
- Modal padding: p-6

### Notification Panel
- Slide-in panel from right (w-96)
- Header: "Notifications" + Mark all read
- Notification items: p-4 each, border-b
  - Icon indicator (status change, new comment)
  - Title + brief message
  - Timestamp
  - Unread indicator (dot or highlight)
- Empty state: centered icon + message

### Tag System
- Predefined tags rendered as rounded-full pills
- Size: px-3 py-1, text-xs
- Categories: Housing, Dining, Academics, Campus Safety, Facilities, Technology, Events, Other
- Always visible in compact form, expandable to show all

### Admin Controls (Inline)
- Dropdown button on post card (only visible to SGA)
- Options: Under Review, In Progress, Completed, Not Planned
- Status renders as badge next to post title
- Badge styles: rounded-full, px-3 py-1, text-xs, font-medium

### Empty States
- Centered layout (max-w-md mx-auto)
- Icon (large, heroicons outline style)
- Heading: text-2xl, font-bold
- Description: text-base
- CTA button if applicable

### Authentication
- Centered card (max-w-md)
- Fisk University logo at top
- Email input with @my.fisk.edu validation
- "Send Magic Link" button
- Minimal, focused design

## Interaction Patterns

**Voting**:
- Click upvote arrow to toggle vote
- Count updates immediately
- Visual state change (filled vs outline)

**Filtering**:
- Multiple filters can be active simultaneously
- Active filters shown as dismissible chips
- Results update immediately

**Status Updates (SGA)**:
- Dropdown appears inline on hover/tap
- Selection updates status badge immediately
- Notification sent to post author

**Image Upload**:
- Drag-and-drop or click to browse
- Preview thumbnail after selection
- Validation messaging for file type/size

## Mobile Responsive Strategy

**Breakpoints**:
- Mobile: base (single column, stacked navigation)
- Tablet: md (maintain single column for readability)
- Desktop: lg (sidebar + main content layouts)

**Mobile Adaptations**:
- Post cards: Upvote moves to footer row
- Navigation: Hamburger menu, icons only
- Filters: Collapsible accordion
- Comment nesting: Maximum 2 levels on mobile
- Notification panel: Full-screen overlay instead of slide-in

## Animation Guidelines
Use sparingly for feedback only:
- Upvote: scale on click (duration-150)
- Status badge: fade in on update (duration-200)
- Notification badge: subtle pulse for new items
- Modal: fade + slide up entrance (duration-300)

No scroll-triggered or decorative animations.