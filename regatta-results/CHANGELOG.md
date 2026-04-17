# Changelog

All notable changes to Regatta Results SA.

---

## [Unreleased] — Dark/Light Mode & Notification Inbox

### Added
- **Dark/Light mode toggle** — full theme switching with CSS custom properties. Persists to `localStorage`. No flash on load.
- **Notification inbox** — bell icon in the nav shows a history of past results alerts. Supports mark-all-read and clear.

---

## [2025-04] — Notifications, Fixes & Search

### Added
- Plain-English event search: type "junior mens pair" and it maps to `JM16 2-`
- Bell toggle on Calendar and Results cards for upcoming races
- Per-event bell notification button on event list rows
- Poll watched races every 60 s for live notification alerts
- Service worker delivery for mobile push notifications + iOS/denied guidance
- Fire separate notifications for each newly-Official event on race-level watches
- Navigate directly to event results when View is clicked on a single-event alert

### Fixed
- Cancel: abort in-flight fetches immediately via `AbortController`
- Cancel ghost-tap restart on mobile
- Mobile sharing: encode selected event in URL as `?event=ID`
- Scroll position restored on back navigation and after alert navigation
- Scroll restoration timing + race-not-found from notification alerts
- Wrong-event routing: auto-open uses mount-time URL only, never live `searchParam`
- Event-list scroll restored on refresh and back navigation in RaceResultsPage
- Bell button was selecting all heats in the same event category
- Notification tap navigation + correct heat URL key
- Refresh landing on Heat 1: use `detailsUrl` path segment as event key

---

## [2025-03] — Live Results, Alerts & Profiles

### Added
- Live auto-refresh on race results pages
- Weather widget on race results page
- Athlete profiles with head-to-head comparison
- Results alerts (in-app notifications for watched regattas)
- Share button on race results page
- Show progression rules on lane draw pages

---

## [2025-02] — Lane Draws, Multi-Day & Hall of Fame

### Added
- Show lane draw entries for upcoming races without results
- Allow clicking upcoming regattas to view lane draws
- Day tabs for multi-day regattas
- Fix event list for multi-day regattas with incomplete draws
- SA Schools Hall of Fame page (2009–2025, Boys & Girls, By Year / By Event)
- Championship Points Standings page
- Roodeplaat Course Records page

---

## [2025-01] — PWA, Calendar & Athlete Search

### Added
- PWA support — installable app on Android and iOS
- Athlete search across all archived regattas
- Regatta calendar with upcoming events
- Countdown timer to next upcoming regatta in the hero section
- South African flag in hero section
- Progression info on event results (e.g. "1st + Next Fastest 4 to Final")
- Upcoming SA National Champs 2026

### Fixed
- White edges on Android — prevent horizontal overflow
- Mobile layout across hero, results grid and race results page

---

## [2024-12] — Donations & Security

### Added
- PayFast donation button (POST form)
- Server-side PayFast signature — credentials removed from bundle

### Fixed
- PayFast: use POST form instead of GET URL

---

## [2024-11] — Auto-Sync & Archive

### Added
- Daily GitHub Action to auto-sync new regattas from rowsa.co.za
- Full hardcoded regatta archive 2014–2023
- Vercel Analytics
- URL routing with react-router-dom

### Fixed
- Show hardcoded regattas when live fetch fails
- Fix crash: remove stale `fetchError` reference
- Fix empty state for years with no hardcoded data
- Move workflow and script to repo root; fix sync script path

---

## [2024-10] — Mobile & Modular Architecture

### Added
- Mobile responsiveness across all pages
- Split monolith into modular file structure
- Vercel proxy rewrite (`/rr-proxy`) for production CORS bypass

---

## [2024-09] — In-App Results Viewer

### Added
- In-app results viewer with dynamic race fetching
- Massive redesign of how results are displayed

---

## [2024-08] — Initial Launch

### Added
- Initial project: static React/Vite site showing South African rowing regatta results
- Basic results browser with year/regatta navigation
