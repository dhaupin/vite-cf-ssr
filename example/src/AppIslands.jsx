/**
 * src/AppIslands.jsx
 * ==================
 * Island registry for the Prestruct example site.
 *
 * Maps data-pre-island names to React components.
 * Imported by main.jsx and passed to mountIslands().
 *
 * Add your own islands here. Each component runs only in the browser --
 * never during SSR prerender. See src/islands.js for the full API.
 */

import SessionTrail from './islands/SessionTrail.jsx'

export const islands = {
  'session-trail': SessionTrail,
}
