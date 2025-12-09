# Contributing to GitHub Stats Widget

Thank you for considering contributing to this project. This document outlines the standards, workflow, and requirements for contributions to ensure code quality, maintainability, and consistency across the repository.

## 1. Project Overview

This project provides a customizable, themeable GitHub statistics widget designed for use in GitHub README files. It includes:

* A client-side widget for displaying profile information.
* Optional backend support for expanded GitHub statistics.
* A modular, multi-file structure with support for CSS themes.
* Embeddable Markdown/HTML links.

Contributions should align with the existing architecture and remain compatible with browser-based embedding.

## 2. How to Contribute

### 2.1 Reporting Issues

Before submitting an issue, verify that the problem has not already been reported. Issue reports should include:

* A clear title and summary.
* Steps to reproduce.
* Expected behavior vs. actual behavior.
* Environment details (browser, hosting setup, operating system).

### 2.2 Requesting Features

Feature requests should include:

* A concise description of the proposed feature.
* The use case or problem it solves.
* Any alternatives considered.

---

## 3. Development Workflow

### 3.1 Fork and Clone

1. Fork the repository.
2. Clone your fork locally:

   ```bash
   git clone <your-fork-url>
   ```
3. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

### 3.2 Project Structure Expectations

The following structure must be preserved:

```
project-root/
│── index.html
│── widget.html
│── generator.html
│── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── theme-light.css
│   │   ├── theme-dark.css
│   │   └── theme-solarized.css
│   └── js/
│       ├── main.js
│       └── widget.js
│── README.md
│── CONTRIBUTING.md
```

All added files must logically fit within this structure and follow existing patterns.

### 3.3 Coding Standards

* Use consistent formatting based on existing files.
* Use semantic HTML.
* Use modular, readable JavaScript.
* Avoid introducing new external dependencies without justification.
* CSS additions should follow the theme-variable structure.

### 3.4 Commit Guidelines

* Commits must be atomic and descriptive.
* Use the following pattern:

  * `fix:` for bug fixes
  * `feat:` for new features
  * `refactor:` for code improvements
  * `docs:` for documentation updates
  * `style:` for formatting and non-functional style changes

Example:

```
feat: add new minimal theme for widgets
```

### 3.5 Pull Request Requirements

All pull requests must include:

* A clear description of the purpose of the change.
* A list of files modified.
* Screenshots when UI changes are involved.
* Tests or validation steps where appropriate.

Pull requests should be kept small and focused.

---

## 4. Guidelines for Frontend Changes

### 4.1 Widget Behavior

Modifications to `widget.js` or UI components must:

* Preserve embeddability in GitHub READMEs.
* Avoid GitHub API calls that require authentication.
* Handle API failures gracefully.
* Maintain compatibility with static hosting such as GitHub Pages.

### 4.2 Theming

* All new UI elements must use CSS variables defined in the theme files.
* Do not hard-code colors, spacing, or typography.

---

## 5. Testing

Before submitting changes:

* Test in at least one Chromium-based browser and Firefox.
* Test using a local HTTP server (not file:// access).
* Validate widget embedding using the generated Markdown snippet.

For backend-supported features (if implemented):

* Ensure behavior is correct with and without backend availability.

---

## 6. Documentation Requirements

Any change that affects usage must include updates to:

* README.md for user-facing information.
* Inline code comments where necessary.

New contributors should ensure documentation remains clear, accurate, and minimal.

---

## 7. Licensing

All contributions must be your own original work. By contributing, you agree that your work will be released under the project's existing license.

---

## 8. Contact

If clarification is needed, open a discussion or issue in the repository.

Thank you for contributing and helping improve this project.
