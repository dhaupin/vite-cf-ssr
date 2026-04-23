---
layout: default
title: React Integration
nav_order: 6
---

# React Integration

Setting up prestruct with React 18+ and React Router v6.

## Requirements

- React 18+
- React Router v6 (BrowserRouter, StaticRouter, Routes, Route)
- Vite 5+

## Installation

If starting fresh with the example template, dependencies are already included:

```bash
npx degit dhaupin/prestruct/example my-app
cd my-app
npm install
```

Otherwise, ensure these are in your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## React Router Setup

### AppLayout.jsx (Critical)

**Must NOT import BrowserRouter.** This is the single most important rule.

```jsx
// src/AppLayout.jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import About from './pages/About'

// Scroll to top on navigation - important for SPA feel
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

export default function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <nav>{/* Your navigation */}</nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about/" element={<About />} />
          <Route path="/blog/" element={<Blog />} />
          <Route path="/blog/:slug/" element={<BlogPost />} />
        </Routes>
      </main>
      <footer>{/* Your footer */}</footer>
    </>
  )
}
```

### App.jsx

Wrap AppLayout in BrowserRouter here:

```jsx
// src/App.jsx
import { BrowserRouter } from 'react-router-dom'
import AppLayout from './AppLayout'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
```

### main.jsx

The entry point handles hydration:

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const root = document.getElementById('root')

if (root.dataset.serverRendered) {
  // SSR content exists - hydrate (no FOUC)
  ReactDOM.hydrateRoot(root, <App />)
} else {
  // No SSR - create fresh root
  ReactDOM.createRoot(root).render(<App />)
}
```

## usePageMeta Hook

Add SEO meta to each page:

```jsx
// src/pages/About.jsx
import usePageMeta from '../hooks/usePageMeta.js'

export default function About() {
  usePageMeta({
    path: '/about/',
    title: 'About | My Site',
    description: 'Learn more about our mission and team.',
  })
  
  return (
    <div>
      <h1>About Us</h1>
      {/* Page content */}
    </div>
  )
}
```

**Tip:** Create a wrapper to avoid repeating siteUrl:

```jsx
// src/hooks/useMeta.js
import usePageMeta from './usePageMeta.js'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://example.com'

export default function useMeta(config) {
  return usePageMeta({
    siteUrl: SITE_URL,
    ...config
  })
}

// Then in pages:
import useMeta from '../hooks/useMeta.js'

export default function About() {
  useMeta({
    path: '/about/',
    title: 'About | My Site',
    description: 'Learn more...',
  })
}
```

## SSR-Safe Patterns

### No Browser APIs at Render Time

```jsx
// Wrong - throws in Node
const theme = localStorage.getItem('theme')

// Correct - guarded
const theme = (() => {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem('theme') || 'light'
})()
```

### No Inline Styles

```jsx
// Wrong - causes hydration mismatch
return <div><style>{`.c { color: red }`}</style></div>

// Correct - use style prop or CSS file
return <div style={{ color: 'red' }} />
```

### No Random Values

```jsx
// Wrong - different each render
const id = Math.random()

// Correct - useEffect for client-only
const [id, setId] = useState()
useEffect(() => setId(Math.random()), [])
```

### Double Quotes for Apostrophes

```jsx
// Wrong - parser error
usePageMeta({ description: "We're open Monday..." })

// Correct - double quotes
usePageMeta({ description: "We're open Monday..." })
```

## Dynamic Routes

For routes with params (blog posts, products), generate them at build time:

```js
// ssr.config.js
const blogPosts = [
  { slug: 'hello-world', title: 'Hello World' },
  { slug: 'second-post', title: 'Second Post' },
]

routes: [
  { path: '/blog/', meta: {...} },
  ...blogPosts.map(post => ({
    path: `/blog/${post.slug}/`,
    meta: {
      title: `${post.title} | Blog`,
      description: `Read ${post.title}`,
    }
  }))
]
```

## React 18 Features

Prestruct works with all React 18 features:

### Suspense

```jsx
import { Suspense, lazy } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### useId

```jsx
// Works in both SSR and client
const id = useId()
```

### Transitions

```jsx
import { useTransition, useState } from 'react'

function Search() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  
  // ...
}
```

## Error Boundaries

Add error handling for graceful failures:

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
```

Wrap routes in AppLayout:

```jsx
<ErrorBoundary>
  <Routes>
    {/* ... */}
  </Routes>
</ErrorBoundary>
```