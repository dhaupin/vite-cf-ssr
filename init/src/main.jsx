/**
 * src/main.jsx
 * ============
 * TEMPLATE FILE -- copy as-is or adjust StrictMode to taste.
 *
 * Responsibilities:
 *   1. Hydrate the prerendered SSR HTML (hydrateRoot) or do a fresh render
 *      (createRoot) depending on whether SSR content is present.
 *   2. Mount dynamic islands into <pre-island> placeholders after hydration.
 *
 * hydrateRoot vs createRoot:
 *   hydrateRoot attaches React's event system to existing SSR DOM without
 *   replacing it. Use it when dist/index.html contains prerendered content
 *   (data-server-rendered="true" on #root). Without it, the browser discards
 *   the SSR HTML and re-renders from scratch, causing FOUC on every page load.
 *
 * Islands:
 *   mountIslands() scans for <pre-island> elements and mounts the registered
 *   React component into each one. Islands are client-only -- they never run
 *   during SSR, so they are invisible to crawlers. Use them for user-specific
 *   or dynamic content (cart, recently viewed, personalization widgets, etc.).
 *   Register your island components in src/AppIslands.jsx.
 *
 * Do NOT import BrowserRouter here. It belongs in App.jsx.
 */

import React    from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { mountIslands } from './islands.js'
import { islands }      from './AppIslands.jsx'

const root = document.getElementById('root')

if (root && root.dataset.serverRendered) {
  ReactDOM.hydrateRoot(root, <React.StrictMode><App /></React.StrictMode>)
} else if (root) {
  ReactDOM.createRoot(root).render(<React.StrictMode><App /></React.StrictMode>)
}

// Mount islands after the main app renders.
// Islands are independent of the React tree -- they get their own createRoot.
mountIslands(islands)
