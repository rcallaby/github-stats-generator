# Architecture & Roadmap — GitHub Stats Widget

## Goals and constraints

* Provide a small, embeddable, themeable GitHub stats widget that can be placed in README.md (via an iframe or hosted image-like badge).
* Prefer zero friction for users: no Personal Access Token (PAT) required by default.
* Keep the client-side portion lightweight and static-host friendly (GitHub Pages-compatible).
* Compute derived stats (total contributions, current streak, longest streak) when possible, but avoid designs that require tokens or violate GitHub's public endpoints or browser CORS restrictions.

Operational constraints discovered while building:

* The GitHub contributions calendar (`https://github.com/users/<user>/contributions`) is *not reliably accessible* from arbitrary browser environments due to CORS policies. Programmatic scraping client-side is frequently blocked by browsers.
* Many features (daily contribution counts, streaks, calendar SVG) therefore require either server-side fetching (proxy) or serverless functions to avoid CORS.

## High-level architecture

### Two-tier approach (default prototype)

1. **Client-only widget (static)** — lightweight HTML/CSS/JS that runs in the browser and is safe to host on GitHub Pages. It shows only data available without scraping-protected endpoints: username, avatar, basic public profile fields, and an embedded fallback image for the contribution graph when direct scraping is blocked. This mode requires no backend or tokens.

2. **Optional server-side proxy (recommended for full features)** — a tiny server or serverless function that fetches the contributions SVG on behalf of the client, sets permissive CORS (or returns parsed JSON), and optionally caches results. With a proxy, the widget can reliably compute total contributions, streaks, longest streak, and insert the contribution SVG into the widget. The proxy does not require authentication or a PAT — it acts only as a CORS bridge.

This hybrid architecture balances **ease-of-deployment** (client-only works out-of-the-box for basic needs) with **feature completeness** (backend unlocks contributions and derived metrics reliably).

## Component breakdown

### Frontend (static)

* `widget.html` — embeddable HTML page used in an iframe; reads `?user=` and `?theme=` query parameters.
* `assets/css/*.css` — base styles + theme variables (light/dark/solarized). Use CSS variables for theming to make adding themes trivial.
* `assets/js/widget.js` — main widget logic: reads params, fetches data (directly or via backend), computes stats, renders SVG or fallback, generates sparkline, handles errors gracefully.
* `index.html` and `generator.html` — development/demo pages for previewing and generating embed snippets.

### Optional Backend (serverless recommended)

* **Proxy endpoint**: `GET /api/contributions?user=<user>` (returns raw contributions SVG or parsed JSON). Sets `Access-Control-Allow-Origin: *` and optionally caches results.
* **Parsed API**: `GET /api/contributions/json?user=<user>` — returns parsed JSON `{ days:[{date,count}], total, currentStreak, longestStreak }` (helps the widget render without parsing SVG in the browser).

Design considerations for backend:

* **No PATs needed**: the proxy fetches the public GitHub endpoint and returns content with permissive CORS. No tokens required unless you want to use GitHub GraphQL for rate-limits/private-repos.
* **Caching**: contributions change once per day for most use cases — cache responses for a reasonable TTL (e.g., 15–60 minutes or a full day). Use CDN or in-memory cache for serverless.
* **Rate limiting & resilience**: add an IP-based rate limit to avoid abuse. Use retries with exponential backoff when fetching GitHub.

## Why this route?

1. **User friction** — requiring a PAT for a simple README widget defeats the 'plug-and-play' expectation. Many end-users will not want to create tokens and risk exposing them. The proxy approach avoids tokens while solving browser CORS.

2. **Deployability** — static assets served from GitHub Pages provide a simple, free hosting option. Serverless proxies (Cloudflare Workers, Vercel Functions, Netlify Functions) are trivial to deploy and inexpensive; they maintain the "no-token" promise while enabling full functionality.

3. **Security & Privacy** — by default the widget exposes only public profile information. If you add authenticated features (private contributions), those should use OAuth flows with explicit consent, not PATs hard-coded in the repo.

4. **Maintainability** — keeping client logic small and parsing logic server-side (optional) reduces cross-browser parsing differences and centralizes changes if GitHub changes the SVG structure.

5. **Progressive enhancement** — the widget works in a degraded state (client-only) and improves when a backend is available. This makes it resilient on localhost, in CI previews, and in static-host environments.

## Detailed flow diagrams (textual)

### Client-only flow (no backend)

1. `widget.html` loads in iframe or page.
2. `widget.js` reads `?user=`.
3. Attempt fetch `https://github.com/users/<user>/contributions` (may be blocked by CORS).

   * If allowed: parse SVG, compute stats in-browser, render calendar + stats.
   * If blocked: display fallback image tag `img.src = https://github.com/users/<user>/contributions` (image resource often allowed by browsers), and render limited stats (username, avatar) using GitHub public API endpoints if available.

### Backend-enabled flow

1. `widget.html` loads and sets data-source to `/api/contributions?user=` hosted on same origin or configured backend URL.
2. `widget.js` fetches `/api/contributions/json?user=`.
3. The backend fetches GitHub contributions SVG, parses it (or returns raw SVG), and returns JSON with stats. Backend sets CORS headers.
4. `widget.js` renders parsed contributions SVG, sparkline, and stats.

## Roadmap — prioritized and actionable

### Priority: Production-readiness (short-term — 1–3 sprints)

1. **Serverless proxy implementation (must)**

   * Provide two examples: Cloudflare Worker (JS) and Vercel serverless function (Node). Include deploy steps and minimal code.
   * Must add caching (TTL=15–60min) and a minimal rate limit.
2. **Unit tests & CI**

   * Add tests for SVG parsing logic (server-side parser) and JS utils (streak calculations).
   * Add GitHub Actions workflow to run linting and tests on PRs.
3. **Embed generator improvements**

   * Add options for size, color palettes, and fallback behaviors.
4. **Accessibility**

   * Ensure all interactive elements have ARIA labels; ensure the widget is keyboard navigable and uses semantic HTML.
5. **Error messaging & telemetry**

   * Improve error messages in the widget and optionally allow maintainers to enable anonymous error reporting (e.g., Sentry) via a config flag.

### Mid-term (3–6 months)

1. **Parsed JSON API**

   * Return structured JSON (`{days, total, current, longest}`) from the backend so multiple frontends (themes/components) can reuse it.
2. **Theme library & plugin system**

   * Add more ready-made themes and enable theme registration (CSS variable bundles or JSON themes).
3. **React component + NPM package**

   * Wrap the widget in a React component for easy integration in docs sites and apps. Publish as `@your-username/github-stats-widget`.
4. **Badge API**

   * Provide a badge endpoint for simple single-line stats (SVG badges) like "streak: 5d" to embed as image badges.
5. **Rate-limit transparency**

   * Expose headers or an endpoint showing cache TTL and remaining quota for the proxy.

### Long-term (6–12+ months)

1. **OAuth-backed private stats (opt-in)**

   * Support optional OAuth flow allowing users to show private contributions with explicit consent. Store refresh tokens securely (or require per-deploy local config).
2. **Hosting as a managed service (optional)**

   * If demand exists, provide an official hosted API that users can whitelist for quicker setup (business model consideration).
3. **Analytics & adoption features**

   * Add usage analytics, templates marketplace for themes, and community-contributed themes.
4. **Advanced visuals**

   * Heatmap animations, interactive tooltips, per-repo contribution breakdowns, and time-travel playback of contributions.

## Developer notes & APIs

### Recommended serverless proxy (requirements)

* Endpoint: `/api/contributions?user=<user>`

  * Returns raw SVG or structured JSON depending on `Accept` header.
  * Sets CORS `Access-Control-Allow-Origin: *` (or restrict to repo domain if desired).
  * Caches responses (in-memory or KV) and respects stale-while-revalidate.
  * Example: Cloudflare Worker script or Vercel function with 15m default TTL.

### JSON contract (suggested)

```json
{
  "user": "octocat",
  "days": [{"date":"2025-12-01","count":4}, ...],
  "total": 1234,
  "current": 6,
  "longest": 32
}
```

### Security and privacy

* Do not store user credentials or PATs in the repository.
* For an OAuth variant, implement server-side token storage using secure secrets (env vars) and never commit them.
* Rate-limit requests to avoid abuse and accidental scraping.

## Testing & validation

* **Local testing**: run the proxy locally and point `widget.js` to `http://localhost:3000/api/contributions?user=...` to verify full behavior.
* **Static-only testing**: open `widget.html` via a local static server (e.g., `npx http-server`) to test degraded mode.
* **End-to-end tests**: add an E2E flow (Playwright) to validate rendering of the widget with the proxy.

## Contribution guidance for feature work

* Small PRs: keep changes focused and testable.
* Provide screenshots for UI changes and a short description for the UX implications.
* Follow commit convention (`feat:`, `fix:`, `docs:`, etc.).
* When modifying parsing logic, add test coverage to guard against upstream GitHub changes.

## Appendix: quick-start deploy options

* **GitHub Pages + optional Proxied API**: host frontend on GitHub Pages, deploy proxy to Cloudflare Workers or Vercel.
* **All-serverless**: host both frontend and backend on Vercel or Netlify (simple and integrated).
* **Self-host**: provide a minimal Node Express server (example in `/examples/express-proxy`) for users who prefer VPS.

