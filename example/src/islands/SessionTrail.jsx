/**
 * src/islands/SessionTrail.jsx
 * ============================
 * Dynamic island -- runs only in the browser, never during SSR prerender.
 *
 * Reads sessionStorage to show which pages the visitor has seen during
 * this visit. Demonstrates that island content is truly client-only:
 * the data doesn't exist at build time, varies per visitor, and is
 * invisible to crawlers.
 *
 * Load strategy: idle (data-pre-load="idle" in the HTML)
 * The trail is low priority -- it loads during browser downtime and
 * doesn't block anything above the fold.
 *
 * This component receives no props. It reads its own data from
 * sessionStorage and updates on mount.
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pre-trail'

const LABELS = {
  '/':       'Home',
  '/about':  'How it works',
  '/deploy': 'Deploy',
}

function recordCurrentPage() {
  const path  = window.location.pathname.replace(/\/$/, '') || '/'
  const trail = getTrail()
  if (!trail.includes(path)) {
    trail.push(path)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail))
  }
  return trail
}

function getTrail() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function SessionTrail() {
  const [trail, setTrail] = useState([])

  useEffect(() => {
    setTrail(recordCurrentPage())
  }, [])

  if (!trail.length) return null

  return (
    <div className="trail-island">
      <p className="trail-label">pages seen this session</p>
      <div className="trail-items">
        {trail.map((path) => (
          <a key={path} href={path} className="trail-item">
            <span className="trail-path">{LABELS[path] ?? path}</span>
            <span className="trail-url">{path}</span>
          </a>
        ))}
      </div>
      <p className="trail-note">
        This widget loaded after hydration via a{' '}
        <code>{'<pre-island data-pre-load="idle">'}</code> placeholder.
        The prerendered HTML for this page contains none of this data.
        Crawlers see the fallback text. You see your session.
      </p>
    </div>
  )
}
