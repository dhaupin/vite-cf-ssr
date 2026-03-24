/**
 * ViewSource.jsx
 * Fetches the live prerendered HTML for the current route and displays
 * the head meta tags with syntax highlighting, proving prestruct baked
 * them in at build time without JavaScript execution.
 */

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://prestruct.creadev.org'

// Tags to extract and display, in order
const TAG_PATTERNS = [
  {
    re: /<title>([^<]+)<\/title>/,
    render: (m) => `<title>${m[1]}</title>`,
  },
  {
    re: /<meta\s+name="description"\s+content="([^"]+)"/,
    render: (m) => `<meta name="description" content="${m[1]}" />`,
  },
  {
    re: /<link\s+rel="canonical"\s+href="([^"]+)"/,
    render: (m) => `<link rel="canonical" href="${m[1]}" />`,
  },
  {
    re: /<meta\s+property="og:url"\s+content="([^"]+)"/,
    render: (m) => `<meta property="og:url" content="${m[1]}" />`,
  },
  {
    re: /<meta\s+property="og:title"\s+content="([^"]+)"/,
    render: (m) => `<meta property="og:title" content="${m[1]}" />`,
  },
  {
    re: /<meta\s+property="og:description"\s+content="([^"]+)"/,
    render: (m) => `<meta property="og:description" content="${m[1]}" />`,
  },
  {
    re: /<meta\s+property="og:image"\s+content="([^"]+)"/,
    render: (m) => `<meta property="og:image" content="${m[1]}" />`,
  },
  {
    re: /<meta\s+name="twitter:title"\s+content="([^"]+)"/,
    render: (m) => `<meta name="twitter:title" content="${m[1]}" />`,
  },
  {
    re: /<script\s+type="application\/ld\+json">([\s\S]+?)<\/script>/,
    render: (m) => `<script type="application/ld+json">${m[1].trim().slice(0, 200)}...</script>`,
  },
]

/**
 * Syntax highlight an HTML tag string.
 * Call this on the raw string BEFORE escaping for display.
 * Returns an HTML string with <span> wrappers for colour.
 */
function highlight(raw) {
  // Escape the raw string for safe HTML insertion
  const esc = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Now apply highlight spans on the escaped text:
  //   &lt;tagname   -> tag colour
  //   attr=         -> attr colour
  //   "value"       -> value colour
  return esc
    // Opening/closing tag names: &lt;tagname or &lt;/tagname
    .replace(/(&lt;\/?)([\w:]+)/g, '$1<span class="t">$2</span>')
    // Attribute names (word chars before =)
    .replace(/\b([\w:-]+)(=&quot;|=")/g, '<span class="a">$1</span>$2')
    // Quoted values
    .replace(/(&quot;|")([^"&]*)(&quot;|")/g, '<span class="v">"$2"</span>')
}

export default function ViewSource() {
  const { pathname } = useLocation()
  const [lines, setLines] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLines(null)
    setError(false)

    const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(r.status)
        return r.text()
      })
      .then(html => {
        const found = []
        for (const pat of TAG_PATTERNS) {
          const m = html.match(pat.re)
          if (m) found.push(pat.render(m))
        }
        setLines(found.length ? found : null)
      })
      .catch(() => setError(true))
  }, [pathname])

  const routeLabel = pathname === '/' ? '/' : pathname

  return (
    <div className="vsw">
      <div className="vsw-bar">
        <span className="vsw-title">live head tags</span>
        <span className="vsw-route">{SITE_URL}{routeLabel}</span>
      </div>
      <div className="vsw-body">
        {!lines && !error && (
          <p className="vsw-loading">fetching...</p>
        )}
        {error && (
          <p className="vsw-loading">
            Could not fetch. View source directly: view-source:{SITE_URL}{routeLabel}
          </p>
        )}
        {lines && lines.map((line, i) => (
          <p
            key={i}
            className="vsw-line"
            dangerouslySetInnerHTML={{ __html: highlight(line) }}
          />
        ))}
      </div>
    </div>
  )
}
