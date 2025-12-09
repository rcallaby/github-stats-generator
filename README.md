# GitHub Stats Widget

A lightweight, embeddable, serverless-friendly GitHub statistics widget designed to run on static sites (including GitHub Pages) without requiring Personal Access Tokens (PATs). This project uses optional Cloudflare Worker and Vercel Serverless Function proxies to securely fetch GitHub data while avoiding rate‑limit and CORS issues.

This repository provides:

* A drop‑in JavaScript widget (`widget.js`) that renders GitHub statistics.
* A serverless proxy implementation (Cloudflare + Vercel) to fetch GitHub API data securely.
* Documentation for deployment, contributing, architecture decisions, and roadmap.

## Features

* **No Personal Access Token (PAT) required**
* **Embeddable widget** for any static site, CMS, or GitHub Pages
* **Configurable serverless proxy** (Cloudflare Workers or Vercel Functions)
* **Graceful fallbacks** for rate limits or API issues
* **Attractive UI** with customizable styling
* **Simple deployment** with detailed guides for each platform

## Project Structure

```plaintext
/
├── widget.js               # Embeddable client-side widget
├── index.html              # Example usage page
├── serverless/
│   ├── cloudflare/worker.js
│   └── vercel/api/github.js
│
├── ARCHITECTURE.md         # Design rationale + roadmap
├── CONTRIBUTING.md         # Contributor guidelines
├── DEPLOYMENT.md           # Proxy deployment guide
└── PAGES_DEPLOYMENT.md     # GitHub Pages hosting guide
```

## Quick Start

### 1. Deploy a Proxy (optional, but recommended)

Choose one:

* **Cloudflare Worker** → see `DEPLOYMENT.md`
* **Vercel Serverless Function** → see `DEPLOYMENT.md`

Copy the deployed proxy URL.

### 2. Add the widget to your site

Include the script:

```html
<script src="./widget.js" defer></script>
```

Add the widget container:

```html
<div
  id="github-stats-widget"
  data-username="octocat"
  data-proxy="https://your-proxy.example.com"
></div>
```

The widget automatically:

* Fetches profile data
* Fetches repo stats
* Displays total stars, forks, followers, and profile info

## Configuration Options

Place these as `data-*` attributes on the widget container:

| Attribute       | Required         | Description                      |
| --------------- | ---------------- | -------------------------------- |
| `data-username` | Yes              | GitHub username to fetch         |
| `data-proxy`    | No (recommended) | URL of proxy endpoint            |
| `data-theme`    | No               | `light`, `dark`, or `auto`       |
| `data-style`    | No               | Additional CSS for customization |

## Serverless Proxy Overview

The GitHub API enforces:

* CORS blocks
* Rate-limits unauthenticated requests

To avoid requiring PATs, this project uses **serverless proxies** which:

* Forward GitHub API calls
* Cache responses
* Add CORS headers
* Offload rate-limits from the client

Supported deployments:

* **Cloudflare Workers**
* **Vercel Functions**

See: `DEPLOYMENT.md`

## GitHub Pages Deployment

If you're hosting this widget or demo on GitHub Pages:

* Point Pages to `main` or `docs` branch
* Ensure `widget.js` is accessible
* Use relative paths (e.g., `./widget.js`)

Full instructions in `PAGES_DEPLOYMENT.md`.

## Architecture Summary

A complete, detailed explanation is in `ARCHITECTURE.md`, including:

* Why serverless proxies were chosen
* Why optional proxy mode exists
* Why the widget avoids heavy frameworks
* Caching, rate-limit strategy, and fallback logic

## Roadmap

The next phase of development aims to add:

* Themes (Cyberpunk, Minimal, Neon, Terminal)
* Support for GitHub Organizations
* Trending repo indicators
* Multi-user comparison widgets
* SVG badge mode
* Local caching using IndexedDB
* User-configurable animations

See details in `ARCHITECTURE.md`.

## Contributing

Contributions are welcome!

Guidelines:

* Follow the style and structure outlined in `CONTRIBUTING.md`
* Ensure PRs pass linting and browser testing
* Open an issue before adding significant features

## Troubleshooting

### The widget does not load

Possible causes:

* Missing `data-username` attribute
* No proxy deployed and rate limits exceeded
* Wrong `data-proxy` URL

### GitHub Pages shows 404 for widget.js

Ensure:

* The file is in the root or `docs/`
* You are using the correct relative path

## License

MIT License


