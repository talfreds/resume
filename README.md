# resume

A TypeScript resume portfolio site built with Vite. The app includes:

- Resume content with light and dark themes
- A Three.js drillhole visualizer (lazy loaded)
- A Lighthouse results page that surfaces performance optimization outcomes
- A playable Minesweeper page with preset and custom difficulty

## Tech Stack

- TypeScript
- Vite
- Three.js

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## App Routes

- `/` - Resume page
- `/lighthouse-results` - Performance and Lighthouse results
- `/minesweeper` - Minesweeper game

## GitHub Pages Deployment

The GitHub Actions workflow lives at `.github/workflows/deploy.yml`.

1. In GitHub, open repository **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually) to deploy.

## Deep-Link Refresh Routing

Because this is a client-side app deployed on GitHub Pages, deep-link refreshes are handled through [public/404.html](public/404.html), which redirects unmatched paths back to the app entry route.
