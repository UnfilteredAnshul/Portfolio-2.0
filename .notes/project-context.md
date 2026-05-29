# Portfolio 2.0 — Project Context

## Session Log
| Date | Summary |
|------|---------|
| 2026-05-29 | Full rescan after: contact form rewrite (direct POST to Web3Forms, rate limiting, Instagram fallback), empty seed data, generic error messages, Drive token health indicator (red dot on Re-auth), fixed `never[]` type error from empty projects.json |

## Identity
Anshul Rajpal's personal portfolio at `https://anshulrajpal.dev`. Next.js 16 + React 19. Dark theme (#000 bg, glass-morphism). TypeScript strict.

## Routes

### Public Pages
| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Home — Hero3D, portrait, category sidebar |
| `/work` | Static | Project grid with category filter, pinned sorting, ProjectModal viewer |
| `/services` | Static | 6 service cards (tilt effect), infinite marquee of featured work, service detail modals |
| `/about` | Static | About, experience timeline, education, skills, contact info |
| `/contact` | Static | Contact form → direct POST to Web3Forms, rate-limited (5-day localStorage cooldown) |

### Admin Pages (`/cmdpanel` — hidden URL, auth required)
| Route | Type | Description |
|-------|------|-------------|
| `/cmdpanel` | Static | Redirects to `/cmdpanel/manager` |
| `/cmdpanel/login` | Static | Google Sign-In + TOTP 2FA login |
| `/cmdpanel/manager` | Static | Full project CRUD, live preview, Drive media management |
| `/cmdpanel/setup-2fa` | Static | QR code display + TOTP verification for 2FA setup |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/google` | POST | Verifies Google ID token, returns session or TOTP challenge |
| `/api/auth/callback` | GET | OAuth callback — exchanges code, verifies email, creates session |
| `/api/auth/totp` | POST | Verifies TOTP code, creates session |
| `/api/auth/verify-2fa` | POST | Standalone TOTP verification (setup page) |
| `/api/auth/setup-2fa` | GET | Returns QR code + TOTP secret |
| `/api/auth/logout` | POST | Clears session cookie |
| `/api/auth/drive-reauth` | GET | Redirects to Google OAuth for Drive scope |
| `/api/auth/drive-reauth/callback` | GET | Handles Drive re-auth callback, displays new refresh token |
| `/api/upload` | POST | Uploads file to Google Drive root folder, returns thumbnail URL + fileId |
| `/api/delete` | POST | Deletes single file from Drive |
| `/api/delete-batch` | POST | Batch deletes files from Drive (used by sendBeacon tab-close cleanup) |
| `/api/drive/sync` | POST | Checks fileIds against Drive, returns `{ missing }` |
| `/api/drive/organize` | POST | Creates category→title folder, moves files, renames to `#1.ext` |

### Special Files
| File | Description |
|------|-------------|
| `proxy.ts` | Next.js 16 proxy (replaces middleware.ts). Exports `proxy` function. Checks IP → 404, validates session, redirects unauthenticated to login |
| `app/layout.tsx` | Root layout — injects JSON-LD (Person, Organization, Website), ProjectsProvider, top-nav, Footer. Suppresses console errors via inline script |
| `app/error.tsx` | Client error boundary — "Something went wrong" + Try Again / Go Home |
| `app/robots.ts` | Allows `/`, disallows `/cmdpanel/` and `/api/` |
| `app/sitemap.ts` | Static pages only: `/`, `/work`, `/services`, `/about`, `/contact` |

## Data Flow

### Projects Data (`lib/projects-context.tsx`)
- **Seed**: `data/projects.json` (currently `[]` — empty)
- **Runtime storage**: `localStorage("portfolio_projects")`
- **Context**: Wraps root layout. On mount, merges seed + localStorage (dedup by `id`). Listens for `storage` and `projects-updated` events.
- **Fallback**: Falls back to empty array when localStorage is empty.

### Contact Form
- Direct POST to `https://api.web3forms.com/submit` via `FormData`
- Access key hardcoded in component (`8ec472af-4a13-4a80-b6d4-a82e5a415064`)
- Rate limited via `localStorage("contact_last_sent")` — 5-day cooldown
- On cooldown: shows dialog with Instagram link (`https://www.instagram.com/shutup.krish/`) + countdown

## Auth System

### Flow
1. User visits `/cmdpanel/manager` → proxy checks session cookie
2. No session → redirect to `/cmdpanel/login`
3. Google Sign-In popup → `/api/auth/google` → if TOTP enabled, temp token → TOTP input → session cookie
4. Session: HMAC-SHA256 signed, stateless, no MaxAge (browser-close cleanup), IP-bound
5. Logout: `beforeunload` sendBeacon + button

### Key Files
- `proxy.ts` — Next.js 16 proxy, IP check, session verification, login redirect
- `lib/session.ts` — `createSession`, `verifySession`, `createTempToken`, `verifyTempToken`

## Admin Panel (`/cmdpanel/manager`)
- Full CRUD for portfolio projects
- Google Drive media upload (OAuth 2.0 refresh token, 350 MB limit)
- Live preview: card preview (385px, right column) + window preview (75vh, below grid)
- ImageEditor: free zoom (0.1x–5x), drag pan, scroll-wheel, fit-to-container
- Media carousel + dnd-kit horizontal filmstrip with position inputs
- Pin system: max 4 pinned (FIFO warning), min 3 enforced
- Category manager: dnd-kit sortable, inline edit, delete with reassign
- Description editor: contentEditable modal with B/I/U, font size, font family
- Drive sync every 3 hours — removes missing media, shows warning banner
- Drive token health indicator (red dot on Re-auth button if token is bad)
- Logout button + tab-close auto-logout

## Google Drive Storage
- **Auth**: OAuth 2.0 refresh token (personal Drive quota)
- **Root folder**: `portfolio-media` (ID: `1q-KqJB1tLeEukrD-z19IIOMsyuqlR8UA`)
- **Flow**: Upload to root → on Save, organize into `portfolio-media/{category}/{title}/#1.ext`
- **URL**: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w2000`
- **Important**: Files must have root as parent during preview (thumbnail URL limitation). After organize, URL stays valid (fileId-based).

## Components

### UI
- `Footer.tsx` — Fixed bottom, social links (Instagram/YouTube/LinkedIn), route-aware styling
- `Hero3D.tsx` — Three.js rotating icosahedron + particle stars
- `SortableList.tsx` — dnd-kit abstraction (SortableList, SortableItem, DragHandle, SortableOverlay)
- `ProjectModal.tsx` — Full-screen project detail overlay with media carousel

### Preview
- `preview/ImageEditor.tsx` — Zoomable/pannable image viewer
- `preview/ProjectCardPreview.tsx` — 385px card live preview
- `preview/FullProjectPreview.tsx` — 75vh window live preview
- `preview/AnimatedSkeleton.tsx` — Shimmer skeleton components

## Environment Variables
| Var | Status |
|-----|--------|
| `GOOGLE_OAUTH_CLIENT_ID` | Active (Drive API + OAuth) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Active |
| `GOOGLE_SIGNIN_CLIENT_ID` | Active (sign-in) |
| `GOOGLE_SIGNIN_CLIENT_SECRET` | Active |
| `GOOGLE_REFRESH_TOKEN` | Active |
| `GOOGLE_DRIVE_FOLDER_ID` | Active |
| `ADMIN_EMAIL` | Active (`contact.unfiltered.anshul@gmail.com`) |
| `SESSION_SECRET` | Active |
| `TOTP_SECRET` | Active |
| `TOTP_ENABLED` | Active (true) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Active |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Active (same as hardcoded in ContactClient) |

## Dependencies
| Status | Package |
|--------|---------|
| Used | next, react, framer-motion, three, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, otplib, qrcode |

## Tests
Vitest + @testing-library/react. 5 files in `__tests__/`. Run: `npx vitest run`

## Styling
- Inline `React.CSSProperties` (~95%)
- Global CSS: dark theme, hero, navigation, category sidebar, responsive breakpoints
- Tailwind installed but NOT used in JSX
- Dark glass-morphism: `rgba(10,10,10,0.8)` + `backdropFilter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.1)`

## Conventions
- `"use client"` for interactive components
- Server components for static pages
- Inline styles over CSS modules
- framer-motion for animations
- Single `useProjects()` hook for project data
- Projects use `id` as unique identifier
- Admin title `'Dashboard'` → renders "Dashboard | Anshul Rajpal"
- Contact form: `FormData` → direct POST to Web3Forms (no proxy route)
- All user-facing errors show "Something went wrong" (no technical details leaked)
- Console errors suppressed via inline script in layout

## Pending
- [ ] Add production domain to Authorized JavaScript origins for sign-in OAuth client
- [ ] Set `ADMIN_IP` env var on Vercel for IP-based 404
- [ ] Verify TOTP setup end-to-end

## 🔒 ABSOLUTE LOCK — DO NOT TOUCH
1. **Drive upload URL** — Must stay `thumbnail?id=FILE_ID&sz=w2000`
2. **Image display code** — `ImageEditor`, `ProjectCardPreview`, `FullProjectPreview` image rendering
3. **OAuth auth flow** — OAuth 2.0 refresh token. No service accounts.
4. **Upload size limit** — 350 MB max
5. **Permissions** — `{ role: 'reader', type: 'anyone' }`
6. **Drive folder hierarchy** — `portfolio-media/{category}/{title}/` on Save + `#1.ext` naming
7. **Organize on Save** — Must be blocking call before state update

## Commands
- `/save` — Log session changes
- `/save --full` — Full project rescan
- `/read` — Display this file
