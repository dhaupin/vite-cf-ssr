---
layout: default
title: CLI Reference
nav_order: 5
---

# CLI Reference

All commands and scripts available in prestruct.

## npm Scripts

Defined in `package.json`:

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run prerender manually
npm run prerender

# Lint code
npm run lint

# Format code
npm run format
```

## Build Pipeline

### `npm run build`

Full production build:

1. **Vite build** - Compiles React app to `/dist`
2. **inject-brand** - Injects prerendered HTML
3. **Prerender** - Generates static pages for each route

Output goes to `/dist` by default.

### `npm run prerender`

Runs just the prerender step:

```bash
# Full prerender
npm run prerender

# Custom config
npm run prerender -- --config custom-config.js
```

Uses `ssr.config.js` by default.

## Development

### `npm run dev`

Starts local dev server:
- Vite dev server on `localhost:5173`
- Hot module replacement enabled
- No SSR (client-side only)

### `npm run preview`

Preview built production build:
- Serves `/dist` locally
- Simulates Cloudflare Pages environment

## Cloudflare CLI

### wrangler

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist

# Deploy with branch
wrangler pages project create my-app
wrangler pages deploy dist --branch=main

# View deployments
wrangler pages deployment list
```

### Environment Variables

```bash
# Set for deploy
CF_PAGES_API_TOKEN=xxx wrangler pages deploy dist
```

## Proxy Scripts

### VPS Proxy

```bash
# Run proxy
node scripts/proxy.js

# With PM2
pm2 start scripts/proxy.js --name prestruct
```

### Worker Deploy

```bash
# Deploy worker
wrangler deploy

# Secret management
wrangler secret put PRESTRUCT_SECRET
```

## Build Hooks

For automatic rebuilds on git push:

```bash
# Cloudflare
wrangler pages project create my-app
# Then add hook URL in Cloudflare dashboard
```

## Common Issues

| Issue | Fix |
|-------|-----|
| Command not found | Check `package.json` scripts |
| Build fails | Run `npm run build` with debug |
| Preview not working | Check `/dist` exists |