# DEPLOYMENT.md — Serverless Proxy Deployment Guide

This document explains how to deploy the **GitHub Stats Widget Serverless Proxies** using either **Cloudflare Workers** or **Vercel Serverless Functions**. These proxies allow the widget to fetch GitHub profile data reliably without requiring a Personal Access Token (PAT), while avoiding browser-side rate limits.

---

# 1. Overview

The GitHub Stats Widget fetches public profile data from the GitHub API. Direct browser calls may:

* Hit unauthenticated rate limits
* Fail in environments like GitHub's image proxy (used in README.md)

A serverless proxy solves this by:

* Calling the GitHub API *from the server*, not the viewer's browser
* Using Cloudflare/Vercel caching for speed and low cost
* Returning normalized JSON for the widget

Use one of the proxy methods below.

---

# 2. Cloudflare Worker Deployment

## 2.1 Requirements

* Cloudflare account
* Wrangler CLI installed locally

Install Wrangler:

```bash
npm install -g wrangler
```

Login:

```bash
wrangler login
```

---

## 2.2 Initialize the Worker Project

```bash
wrangler init github-stats-proxy
```

Replace the auto-generated Worker code (`src/index.js`) with the following:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const username = url.searchParams.get("user");

    if (!username) {
      return new Response(JSON.stringify({ error: "Missing user parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const githubUrl = `https://api.github.com/users/${username}`;
    const githubRes = await fetch(githubUrl, {
      headers: {
        "User-Agent": "GitHub-Stats-Widget",
        "Accept": "application/vnd.github+json"
      }
    });

    const data = await githubRes.json();

    return new Response(JSON.stringify(data), {
      status: githubRes.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600"
      }
    });
  }
};
```

---

## 2.3 Deploy to Cloudflare

```bash
wrangler publish
```

Your deployment URL will look like:

```
https://github-stats-proxy.<yourname>.workers.dev/?user=octocat
```

Use this URL in your widget.

---

# 3. Vercel Serverless Function Deployment

## 3.1 Requirements

* Vercel account
* Vercel CLI installed locally

Install Vercel:

```bash
npm install -g vercel
```

Initialize project:

```bash
vercel init
```

---

## 3.2 Add Serverless Function

Create a file at:

```
/api/github.js
```

Paste:

```javascript
export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing user parameter" });
  }

  const githubUrl = `https://api.github.com/users/${user}`;

  try {
    const githubRes = await fetch(githubUrl, {
      headers: {
        "User-Agent": "GitHub-Stats-Widget",
        "Accept": "application/vnd.github+json"
      }
    });

    const data = await githubRes.json();

    // Cache using Vercel's CDN
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    return res.status(githubRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "GitHub proxy error", details: err.message });
  }
}
```

---

## 3.3 Deploy to Vercel

```bash
vercel --prod
```

Your endpoint will look like:

```
https://yourproject.vercel.app/api/github?user=octocat
```

Use this URL in the widget.

---

# 4. Configuring the Widget to Use the Proxy

In your `widget.js`, replace:

```javascript
const endpoint = `https://api.github.com/users/${username}`;
```

with your proxy endpoint:

```javascript
const endpoint = `https://yourproxy.com/api/github?user=${username}`;
```

This makes all requests:

* Cacheable
* More reliable
* Rate-limit resistant

---

# 5. Choosing Between Cloudflare and Vercel

| Feature     | Cloudflare Workers        | Vercel Functions           |
| ----------- | ------------------------- | -------------------------- |
| Free Tier   | Excellent                 | Good                       |
| Cold Starts | None (edge runtime)       | Minimal                    |
| Caching     | Built-in edge cache       | CDN cache headers          |
| Best For    | Fastest response globally | Simplicity + Next.js users |

Both are excellent — choose whichever fits your hosting stack.

---

# 6. Best Practices

* Do **not** store PATs unless extending endpoints (optional).
* Always set caching headers (`s-maxage`).
* Keep responses JSON and minimal.
* Avoid adding heavy logic to the proxy.

---

# 7. Future Enhancements

* Combined `/api/stats` endpoint including contributions.
* Proxy-level HTML scraping for activity streaks.
* SVG card rendering (stats cards).
* Multi-proxy redundancy (Cloudflare + Vercel fallback).

---

# 8. Summary

You now have:

* A Cloudflare Worker deployment path
* A Vercel Serverless Function deployment path
* Ready-to-use code for both
* Integration steps for the widget
* Best practices for reliability

