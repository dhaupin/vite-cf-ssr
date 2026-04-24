---
layout: default
title: Changelog
nav_order: 17
---

Release history for prestruct.

## v0.2.4 (Development)

Changes since v0.2.2:

### Core Features
- Islands architecture for dynamic client-only content
- Proxy support for bot rendering (VPS and Worker)
- BrowserRouter isolation pattern
- Prerender pipeline improvements
- ssrLoadModule over vite build --ssr (required for proper StaticRouter context)
- Dynamic islands with client-only rendering
- Proxy cache key using SHA-256 hash

### Documentation
- 21 guides covering all aspects
- Header layout: flexbox ordering with wordmark → nav → actions
- Submenu accordion: close previous before opening new
- Peaceiris gh-pages bug warning added to AGENTS.md
- Content style guide with briefs rule
- CLI Reference, Contributing, Examples guides
- Changelog, Roadmap, Redirects guides
- Expanded guides by default
- Mobile flyout menu fixes
- PrismJS syntax highlighting with copy buttons
- Remove duplicate h1 headings
- Pagefind search integration with ⌘K shortcut
- baseurl handling for search URLs
- 15 prestruct-specific guides added
- 4 more guides: Edge Functions, Design Systems, CI/CD, Multi-site
- 3 more guides: Proxy, PWA, Images
- 3 more guides: i18n, Analytics & Monitoring, Security
- 4 more guides: Advanced Islands, Testing, Structured Data, Build Optimization

### Layout
- Light mode with toggle switch
- Dynamic nav from config
- Mobile burger menu improvements
- Theme toggle and breakpoint fixes
- Mobile nav folder items default hidden
- Backdrop-filter only on dark mode header

### Infrastructure
- GitHub Pages baseurl config
- Jekyll layout fixes
- 404 noindex handling
- Artifact deploy instead of branch deploy (peaceiris bug)

## v0.2.2 (Stable)

Initial stable release:

### Core
- Vite integration for React SSR
- Prerender pipeline for build-time static generation
- Cloudflare Pages deployment

### Architecture
- ssrLoadModule for SSR rendering
- Component islands with lazy mounting
- Build-time prerendering

### Guides
- Getting Started, Configuration, Vite Integration
- SEO, Performance, Routing, Architecture
- Troubleshooting, Migration, Advanced Islands

See git log for detailed history:

```bash
git log --oneline
```

Full release notes: https://github.com/dhaupin/prestruct/releases
