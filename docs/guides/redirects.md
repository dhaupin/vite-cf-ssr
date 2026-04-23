---
layout: default
title: Redirects
nav_order: 20
---

# Redirects

Managing redirects on Cloudflare Pages.

## Cloudflare Pages Redirects

Create `_redirects` file in your project root:

```
# Static redirects
/source  /destination  301

# Wildcard redirects
/blog/*  /articles/:splat  301
```

## Common Patterns

### Trailing Slashes

Cloudflare Pages Pretty URLs handles this automatically. Do not add rules for `/path/` → `/path`.

### HTTPS Only

```toml
# wrangler.toml
compatibility_date = "2023-01-01"
```

### Internationalization

```toml
/en/*  /en/:splat  200
/fr/*  /fr/:splat  200
/de/*  /de/:splat  200
```

## Headers vs Redirects

| Use Case | Method |
|----------|--------|
| Path change | Redirect |
| CORS setup | Headers |
| Cache control | Headers |
| Security headers | Headers |

## Headers File

Create `_headers` in your project root:

```
# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML pages - no cache
/*
  Cache-Control: no-cache
```

## Security Headers

```toml
# _headers
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## SPA Fallback

> **Warning:** Remove `/* /index.html 200` after prerendering all routes.

If all routes are prerendered, you don't need SPA fallback. The static HTML files handle all routes.

## Testing Redirects

Use `wrangler pages dev` to test locally:

```bash
wrangler pages dev dist
# Visit URLs to test redirects
```

## Production

Deploy updates `_headers` and `_redirects` automatically:

```bash
wrangler pages deploy dist
```