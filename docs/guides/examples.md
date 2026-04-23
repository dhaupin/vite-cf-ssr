---
layout: default
title: Examples
nav_order: 19
---

# Examples

Real-world projects using prestruct.

## Starter Template

The fastest way to get started:

```bash
npx create-prestruct-app my-app
cd my-app
npm install
npm run dev
```

See [Getting Started](/guides/getting-started) for full instructions.

## Project Structure

Typical prestruct project:

```
my-app/
├── src/
│   ├── App.jsx           # Main app with BrowserRouter
│   ├── AppLayout.jsx     # Layout component (no BrowserRouter)
│   ├── routes/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── Blog.jsx
│   ├── components/
│   │   └── Header.jsx
│   └── islands/
│       └── Cart.jsx      # Dynamic island component
├── scripts/
│   ├── prerender.js      # Build-time prerender
│   └── proxy.js          # Optional bot proxy
├── ssr.config.js         # Prerender configuration
├── wrangler.toml         # Cloudflare Pages config
├── package.json
└── vite.config.js
```

## Common Patterns

### Static Site with Islands

```jsx
// AppLayout.jsx - renders at build time
import { Routes, Route } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div>
      <nav>...</nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <footer>...</footer>
    </div>
  )
}
```

### Dynamic Island Component

```jsx
// islands/Cart.jsx
export default function Cart() {
  const [items, setItems] = useState([])
  
  return (
    <pre-island data-pre-load="visible">
      <CartWidget items={items} />
    </pre-island>
  )
}
```

Mount in client:

```js
// main.jsx
import { mountIslands } from './islands'

mountIslands()
```

## Deploy to Cloudflare Pages

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist
```

## With Proxy

For dynamic routes or frequent content updates:

1. Set `config.proxy.url` in `ssr.config.js`
2. Deploy proxy worker
3. Point Cloudflare Pages to proxy URL

See [Proxy Guide](/guides/proxy) for full setup.

## Showcase

Have a project you'd like featured here? Open an issue!