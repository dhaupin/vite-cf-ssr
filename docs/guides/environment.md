---
layout: default
title: Environment Variables
nav_order: 30
---

# Environment Variables

Managing configuration across environments.

## Types of Variables

### Build Time

Set at build time, embedded into the bundle:

```js
// vite.config.ts
export default defineConfig({
  define: {
    VITE_APP_TITLE: JSON.stringify(process.env.VITE_APP_TITLE)
  }
})
```

Then use in code:
```js
console.log(import.meta.env.VITE_APP_TITLE)
```

### Runtime

Set at runtime (Cloudflare Pages settings):

```toml
# wrangler.toml
[vars]
SITE_TITLE = "My Site"
```

Access in Functions:
```js
export function onRequestGet({ env }) {
  console.log(env.SITE_TITLE)
}
```

## Vite Environment Variables

### Default Variables

| Variable | Description |
|----------|-------------|
| `import.meta.env.MODE` | 'development' or 'production' |
| `import.meta.env.PROD` | True in production |
| `import.meta.env.DEV` | True in development |
| `import.meta.env.BASE_URL` | Base URL |

### Custom Variables

```env
# .env
VITE_SITE_URL=https://example.com
VITE_API_URL=https://api.example.com
VITE_GA_ID=G-XXXXXXXXXX
```

```env
# .env.development
VITE_API_URL=http://localhost:3000
```

```env
# .env.production
VITE_API_URL=https://api.example.com
```

### Access in Code

```js
// Components
const siteUrl = import.meta.env.VITE_SITE_URL

// Conditional logic
if (import.meta.env.DEV) {
  console.log('Development mode')
}
```

## Cloudflare Variables

### Pages Settings

Set in Cloudflare Dashboard → Pages → Your project → Settings → Environment variables:

| Variable | Value |
|----------|-------|
| `PRODUCTION` | `true` |
| `API_URL` | `https://api.example.com` |

### Access in Functions

```js
export function onRequestGet({ env }) {
  const apiUrl = env.API_URL
}
```

### Secrets

```bash
# Create secret
wrangler secret put API_KEY
# Enter value when prompted

# Access
export function onRequestGet({ env }) {
  const apiKey = env.API_KEY
}
```

## Prestruct Config Variables

### Using in ssr.config.js

```js
// ssr.config.js
export default {
  siteUrl: process.env.VITE_SITE_URL || 'https://example.com',
  // ...
}
```

### Using in Components

```js
// During prerender, import.meta.env is available
const siteUrl = import.meta.env.VITE_SITE_URL
```

## Best Practices

### Don't Expose Secrets

```js
// Bad - secret in client code
const apiKey = import.meta.env.VITE_API_KEY  // Exposed!

// Good - use Cloudflare Functions only
// env.API_KEY only available in functions/
```

### Use Different Values Per Environment

```
.env              # Default (development)
.env.local       # Local overrides (not committed)
.env.development # Development
.env.staging     # Staging
.env.production  # Production
```

### Example .env Files

```env
# .env
VITE_SITE_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
VITE_GA_ID=
```

```env
# .env.production
VITE_SITE_URL=https://example.com
VITE_API_URL=https://api.example.com
VITE_GA_ID=G-XXXXXXXXXX
```

## TypeScript Types

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_GA_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Gitignore

```gitignore
# .env
.env.local
.env.*.local
```

Commit `.env.example` instead:

```env
# .env.example
VITE_SITE_URL=https://example.com
VITE_API_URL=https://api.example.com
VITE_GA_ID=
```

## Use Cases

### Feature Flags

```env
VITE_ENABLE_BETA=true
```

```js
const betaEnabled = import.meta.env.VITE_ENABLE_BETA === 'true'
```

### API Configuration

```js
const apiBase = import.meta.env.VITE_API_URL

async function fetchUsers() {
  const res = await fetch(`${apiBase}/users`)
  return res.json()
}
```

### Analytics IDs

```env
VITE_GA_ID=G-XXXXXXXXXX
VITE_SEGMENT_WRITE_KEY=abcdef
```

```js
// Load analytics only if ID is set
if (import.meta.env.VITE_GA_ID) {
  // Initialize GA
}
```

## CI/CD Integration

### GitHub Actions

```yaml
env:
  VITE_SITE_URL: ${{ vars.SITE_URL }}
```

Set in repo Settings → Variables.

### Per-Environment Deploys

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    env:
      VITE_SITE_URL: https://staging.example.com
    steps:
      - run: npm run build

  deploy-prod:
    # Different config
```

## Common Patterns

### Conditionally Render

```jsx
// Show debug info only in development
{import.meta.env.DEV && (
  <DebugPanel />
)}
```

### API Base URL

```js
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  return import.meta.env.VITE_API_URL
}
```

### Feature Flags

```js
const features = {
  newDashboard: import.meta.env.VITE_NEW_DASHBOARD === 'true',
  beta: import.meta.env.VITE_BETA === 'true',
}
```

## Checklist

- [ ] Use `.env.example` to document required variables
- [ ] Never commit secrets to git
- [ ] Use different values per environment
- [ ] Use TypeScript interfaces for env vars
- [ ] Don't expose secrets to client code
- [ ] Use Cloudflare secrets for sensitive data