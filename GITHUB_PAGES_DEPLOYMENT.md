# GitHub Pages Deployment Guide — GitHub Stats Widget

This guide explains how to deploy the **GitHub Stats Widget** to **GitHub Pages**, so you can:

* host the widget UI and embeddable `widget.html`
* generate shareable URLs (for README badges, dashboards, etc.)
* use your own serverless proxy endpoints
* support theming via CSS

This document assumes you already have the project files (`index.html`, `widget.html`, `assets/`, `scripts/`, etc.).

---

# 1. Repository Setup

You will host the widget on GitHub Pages using either:

* **Main branch root**, or
* **`docs/` folder** (optional), or
* **Dedicated `gh-pages` branch**

The simplest approach is to host directly from the **main branch**.

## Steps

1. Create a new GitHub repository (or use your existing one):

   * Name suggestion: `github-stats-widget`

2. Add your project files:

   ```
   index.html
   widget.html
   generator.html
   assets/
     css/
     js/
   serverless-proxies/ (optional)
   README.md
   ```

3. Commit and push your project:

   ```bash
   git add .
   git commit -m "Initial widget deployment"
   git push origin main
   ```

---

# 2. Enable GitHub Pages

1. Go to your repository on GitHub.

2. Click **Settings** → **Pages**.

3. Under **Build and Deployment**, select:

   **Source:** `Deploy from a branch`

   **Branch:** `main` and `/ (root)`

4. Click **Save**.

GitHub will deploy your widget automatically.

You’ll receive a deployment URL like:

```
https://<your-username>.github.io/github-stats-widget/
```

---

# 3. Verify Deployment

Visit:

```
https://<your-username>.github.io/github-stats-widget/
```

You should see your main demo page (`index.html`).

Check widget embed endpoint:

```
https://<your-username>.github.io/github-stats-widget/widget.html?user=octocat
```

If it loads correctly, deployment is working.

---

# 4. Configure Proxy Endpoint (Required for README Embeds)

Your `widget.js` needs to call your proxy URL instead of GitHub API directly.

Example:

```javascript
const endpoint = "https://yourproxy.example.com/api/github?user=" + username;
```

Supported proxies:

* Cloudflare Worker (fastest)
* Vercel Serverless Function

Once deployed, update the widget code accordingly.

---

# 5. Embedding in a README

After GitHub Pages deployment, you can embed your widget via:

### Markdown Embed

```md
![GitHub Stats](https://<your-username>.github.io/github-stats-widget/widget.html?user=<yourusername>)
```

### HTML Embed

```html
<iframe
  src="https://<your-username>.github.io/github-stats-widget/widget.html?user=<yourusername>"
  width="400"
  height="220"
  frameborder="0"
></iframe>
```

> **Tip:** If you want clean PNG or SVG output, you can implement an image-rendering endpoint later.

---

# 6. Custom Domains (Optional)

You may set up a custom domain for a more polished experience.

Steps:

1. Go to **Settings → Pages**.
2. Under **Custom Domain**, enter your domain.
3. Configure DNS using:

   * CNAME → `<your-username>.github.io`

Then your widget loads from:

```
https://stats.yourdomain.com/widget.html?user=<username>
```

---

# 7. Deploying Updates

GitHub Pages redeploys automatically whenever you push to your selected branch.

Recommended commands:

```bash
git add .
git commit -m "Update widget"
git push
```

Deployment takes about 20–40 seconds.

---

# 8. Optional: `docs/` Folder Deployment

If you prefer keeping the root clean:

1. Create a `docs/` folder
2. Move your widget files inside it
3. Configure Pages source to `main /docs`

URL becomes:

```
https://<user>.github.io/repo/docs/widget.html
```

---

# 9. Optional: `gh-pages` Branch Deployment

Ideal for automated workflows.

Setup:

```bash
npm install -g gh-pages
```

Deploy:

```bash
gh-pages -d .
```

---

# 10. Troubleshooting

### Widget doesn't load on README

GitHub README sanitizes iframes.
Use **a generated image endpoint** or **a link**, e.g.:

```
[View Stats](https://<user>.github.io/github-stats-widget/widget.html?user=<you>)
```

### API rate limit errors

Ensure your `widget.js` uses your serverless proxy instead of GitHub’s API.

### Cross-origin errors

If using Vercel, ensure CORS headers:

```javascript
res.setHeader("Access-Control-Allow-Origin", "*");
```

Cloudflare Workers allow this by default.

### 404 errors

Ensure Pages is configured to use the correct branch and folder.

---

# 11. Summary

You now have:

* GitHub Pages hosting configured
* Widget deployment validated
* Proxy integration documented
* Embed instructions for README and HTML
* Options for custom domains & alternate deployment strategies

Your GitHub Stats Widget is now fully deployable, maintainable, and embeddable via GitHub Pages.
