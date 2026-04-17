# Changelog

All notable changes to Regatta Results SA.

---

## [2026-04-17] — Dark/Light Mode, Notification Inbox & SnapScan

### Added
- **Dark/Light mode toggle** — full theme switching with CSS custom properties. Persists to `localStorage`. No flash on load.
- **Notification inbox** — bell icon in the nav shows a history of past results alerts. Supports mark-all-read and clear.
- **Background push notifications** — works even with the app closed, via Upstash Redis + GitHub Actions cron every 5 min.
- **SnapScan donations** — replaced PayFast with a simple SnapScan QR code + button.

---

## [2026-04-17] — Notification Fixes & Bell Button

### Fixed
- Bell button was selecting all heats in the same event category
- Navigate directly to event results when View is clicked on a single-event alert
- Restore event-list scroll on refresh and back navigation in RaceResultsPage
- Wrong-event routing: auto-open uses mount-time URL only, never live `searchParam`
- Notification tap navigation + correct heat URL key
- Refresh landing on Heat 1: use `detailsUrl` path segment as event key
- Fire separate notifications for each newly-Official event on race-level watches
- Scroll restoration: save-on-click + useLayoutEffect + retry loop
- Scroll restoration timing + race-not-found from notification alerts
- Restore scroll position on back navigation + fix App.jsx alert navigate
- Mobile notifications: service worker delivery + iOS/denied guidance

### Added
- Poll watched races every 60 s for live notification alerts
- Per-event bell notification button on event list rows
- Bell toggle on Calendar and Results cards for upcoming races

---

## [2026-04-16] — Live Results, Profiles, Lane Draws & Search

### Added
- Live auto-refresh on race results pages
- Weather widget, athlete profiles and head-to-head comparison
- Results alerts (in-app notifications for watched regattas)
- Day tabs for multi-day regattas
- Allow clicking upcoming regattas to view lane draws
- Show lane draw entries for upcoming races without results
- SA Schools Hall of Fame page (2009–2025, Boys & Girls, By Year / By Event)
- Show progression rules on lane draw pages
- Plain-English event search: type "junior mens pair" → maps to `JM16 2-`
- Fix cancel: abort in-flight fetches immediately via `AbortController`

### Fixed
- Cancel ghost-tap restart on mobile
- Mobile sharing: encode selected event in URL as `?event=ID`
- Fix event list for multi-day regattas with incomplete draws

---

## [2026-04-15] — PWA, Records, Points & Mobile

### Added
- PWA support — installable app on Android and iOS
- Roodeplaat Course Records page
- Championship Points Standings page
- Share button on race results page
- Countdown timer to next upcoming regatta in the hero section
- South African flag in hero section
- Progression info on event results (e.g. "1st + Next Fastest 4 to Final")
- Secure PayFast: sign payments server-side, credentials removed from bundle

### Fixed
- White edges on Android — prevent horizontal overflow
- Mobile layout across hero, results grid and race results page

---

## [2026-04-14] — Core Platform

### Added
- In-app results viewer with dynamic race fetching
- Modular file structure (split from monolith)
- Vercel proxy rewrite (`/rr-proxy`) for production CORS bypass
- Vercel Analytics
- URL routing with react-router-dom
- Full hardcoded regatta archive 2014–2023
- Daily GitHub Action to auto-sync new regattas from rowsa.co.za
- Athlete search, regatta calendar
- PayFast donation button (POST form)

### Fixed
- Show hardcoded regattas when live fetch fails
- Fix crash: remove stale `fetchError` reference
- Fix empty state for years with no hardcoded data
- Move workflow and script to repo root

---

## [2026-03-15] — Initial Launch

### Added
- Initial project: static React/Vite site showing South African rowing regatta results
- Basic results browser with year/regatta navigation
