---
layout: default
title: Multi-site
nav_order: 26
---

# Multi-site

Managing multiple prestruct sites from one codebase or repository.

## When to Use Multi-site

- Multiple brands under one organization
- Localization with complete site variations
- Client projects in one repo
- Microsites

## Approach 1: Single Repo, Multiple Configs

### Directory Structure

```
my-projects/
├── sites/
│   ├── site-a/
│   │   ├── ssr.config.js
│   │   ├── src/
│   │   └── public/
│   ├── site-b/
│   │   ├── ssr.config.js
│   │   ├── src/
│   │   └── public/
│   └── site-c/
├── shared/
│   ├── components/
│   └── hooks/
└── package.json
```

### Package.json Scripts

```json
{
  "scripts": {
    "build:site-a": "cd sites/site-a && npm run build",
    "build:site-b": "cd sites/site-b && npm run build",
    "build:all": "npm run build:site-a && npm run build:site-b",
    "deploy:site-a": "cd sites/site-a && wrangler pages deploy dist",
    "deploy:site-b": "cd sites/site-b && wrangler pages deploy dist"
  }
}
```

### Shared Components

```js
// sites/site-a/src/AppLayout.jsx
import Button from '../../shared/components/Button'
import { useMeta } from '../../shared/hooks/useMeta'

// Site-specific config
const SITE = 'site-a'
```

## Approach 2: One Config, Multiple Sites

### Config Structure

```js
// ssr.config.js
const SITES = {
  brandA: {
    siteUrl: 'https://brand-a.com',
    siteName: 'Brand A',
    ogImage: 'https://brand-a.com/og.png',
  },
  brandB: {
    siteUrl: 'https://brand-b.com', 
    siteName: 'Brand B',
    ogImage: 'https://brand-b.com/og.png',
  }
}

// Determine site from environment
const SITE = process.env.SITE_NAME || 'brandA'
const config = SITES[SITE]

export default {
  ...config,
  routes: getRoutes(config.siteUrl),
}
```

### Environment-Based Builds

```bash
SITE_NAME=brandA npm run build
SITE_NAME=brandB npm run build
```

### CI Pipeline

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy-a:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Brand A
        run: |
          SITE_NAME=brandA npm run build
      - name: Deploy Brand A
        run: |
          wrangler pages deploy dist --project-name=brand-a

  deploy-b:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Brand B
        run: |
          SITE_NAME=brandB npm run build
      - name: Deploy Brand B
        run: |
          wrangler pages deploy dist --project-name=brand-b
```

## Approach 3: Monorepo

### Structure

```
my-monorepo/
├── packages/
│   ├── ui/              # Shared components
│   │   ├── package.json
│   │   └── src/
│   └── config/          # Shared config
│       ├── package.json
│       └── src/
├── sites/
│   ├── site-a/
│   │   ├── package.json
│   │   └── src/
│   └── site-b/
│       ├── package.json
│       └── src/
├── package.json
└── pnpm-workspace.yaml
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'sites/*'
```

### Package References

```json
// sites/site-a/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/config": "workspace:*"
  }
}
```

## Shared Component Library

### Publish as Package

```
@myorg/ui/
├── dist/
│   ├── index.js
│   └── styles.css
├── src/
│   ├── Button.jsx
│   └── index.js
└── package.json
```

### Use in Sites

```js
// sites/site-a/src/AppLayout.jsx
import { Button, Card } from '@myorg/ui'
import '@myorg/ui/styles.css'
```

## Theming

### CSS Variables Per Site

```css
/* sites/site-a/styles.css */
:root {
  --color-primary: #0066cc;
  --color-secondary: #004499;
}

/* sites/site-b/styles.css */
:root {
  --color-primary: #cc6600;
  --color-secondary: #994400;
}
```

### Runtime Theme Switching

```js
// Use island for theme picker
<pre-island data-pre-island="theme-picker" />

// src/islands/ThemePicker.jsx
export default function ThemePicker() {
  // Check URL param or cookie
  const theme = new URLSearchParams(window.location.search).get('theme')
  
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }
  
  return null
}
```

## Deployment Strategies

### Parallel Deploys

```yaml
deploy-all:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy A
      run: npm run deploy:site-a
    - name: Deploy B  
      run: npm run deploy:site-b
    - name: Deploy C
      run: npm run deploy:site-c
```

### Sequential (for dependencies)

```yaml
deploy:
  steps:
    - name: Build shared
      run: npm run build:shared
    - name: Deploy sites
      run: |
        npm run build:site-a
        npm run deploy:site-a
        npm run build:site-b
        npm run deploy:site-b
```

## Build Optimization

### Shared node_modules

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: |
      */node_modules
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

### Build Only Changed

```yaml
- name: Check changes
  id: changes
  uses: dorny/paths-filter@v2
  with:
    filters: |
      site-a:
        - 'sites/site-a/**'
      site-b:
        - 'sites/site-b/**'

deploy-a:
  needs: changes
  if: needs.changes.outputs.site-a == 'true'
  runs-on: ubuntu-latest
  steps:
    - run: npm run build:site-a
```

## Environment Config

### Per-Site Environments

```bash
# Site A
SITE_NAME=siteA
SITE_URL=https://site-a.com
API_URL=https://api.site-a.com

# Site B  
SITE_NAME=siteB
SITE_URL=https://site-b.com
API_URL=https://api.site-b.com
```

### Vite Environment

```js
// vite.config.js
export default defineConfig({
  define: {
    'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL),
    'import.meta.env.SITE_NAME': JSON.stringify(process.env.SITE_NAME),
  }
})
```

## Shared Routes

### Central Route Config

```js
// packages/shared-config/routes.js
export const commonRoutes = [
  { path: '/', meta: { title: 'Home' }},
  { path: '/about/', meta: { title: 'About' }},
  { path: '/contact/', meta: { title: 'Contact' }},
]

export const blogRoutes = [
  { path: '/blog/', meta: { title: 'Blog' }},
  { path: '/blog/post-1/', meta: { title: 'Post 1' }},
]

// In site config
import { commonRoutes, blogRoutes } from '@myorg/config'

routes: [...commonRoutes, ...blogRoutes]
```

## Checklist

- [ ] Choose approach (configs, env vars, monorepo)
- [ ] Share components where possible
- [ ] Use CSS variables for theming
- [ ] Automate deploys with CI
- [ ] Cache dependencies
- [ ] Test each site configuration