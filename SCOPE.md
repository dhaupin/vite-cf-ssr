# SCOPE.md: Prestruct

What this is, what it isn't, and what's left to do.

---

## What was done in v2

v1 was extracted from a production app with app-specific strings throughout.
v2 completes the P0 items from v1's SCOPE.md:

- [x] **Config interface extracted.** All brand identity and routes live in
  `ssr.config.js`. No app-specific strings in any engine file.
- [x] **`brand.js` coupling removed.** `prerender.js` and `inject-brand.js` import
  from `ssr.config.js` only.
- [x] **`usePageMeta` decoupled.** Accepts `siteUrl` as a prop or reads from
  `VITE_SITE_URL` env. No brand file imports.
- [x] **Template vs engine separation documented.** Engine files (prerender, inject-brand,
  usePageMeta) are copy-once, never-edit. Template files (App, AppLayout, main.jsx)
  need minor app-specific wiring.
- [x] **All app-specific strings removed.** `_headers`, `_redirects`, `index.html`,
  and all scripts are now fully generic.
- [x] **Validated against a second app.** A second production app validated the config interface and uncovered several new gotchas documented in AGENTS.md. Please look over them before embarking.
- [x] **Dynamic islands.** Client-only `<pre-island>` placeholders let dynamic content
  (cart widgets, recently viewed, personalization) mount after hydration without
  appearing in the prerendered HTML. Three load strategies: eager, visible, idle.
  Registered in `src/AppIslands.jsx`, mounted by `src/islands.js`.

---

## What was done in the proxy sprint

- [x] **Render proxy: VPS.** `scripts/proxy.js` -- Express + Puppeteer, single shared
  browser process, disk cache with SHA-256 keys, authenticated cache-refresh header,
  302 redirect for non-bots, graceful render fallback on Puppeteer error.

- [x] **Render proxy: Cloudflare Worker.** `scripts/proxy.worker.js` -- same contract
  as the VPS proxy, using `@cloudflare/puppeteer` (Browser Rendering API) and KV for
  cache storage. Requires Workers Paid plan.

- [x] **Config extended.** `config.proxy` block added to `ssr.config.js`:
  `url`, `secret`, `targetUrl`, `botList`. All fields optional. Null `url` means
  proxy is disabled -- zero change to the build pipeline.

- [x] **CSP auto-update.** `inject-brand.js` reads `config.proxy.url` after build
  and appends the proxy origin to `connect-src` in `dist/_headers`. Idempotent --
  safe to run multiple times, no duplicate entries.

- [x] **wrangler.toml template.** Included for Worker deployments. Documents all
  required bindings and env vars.

- [x] **proxy.package.json.** Separate package.json for the proxy runtime (Express,
  Puppeteer, Wrangler). Kept separate from the main app so proxy deps are only
  installed on the host that needs them.

- [x] **README-proxy.md.** End-to-end setup guide for both runtimes, cache flush
  instructions, and the targetUrl override pattern.

---

## What Prestruct is

- A thin prerender layer for existing Vite + React + CF Pages apps
- A set of debugged scripts + patterns you drop into a project
- Opinionated about CF Pages specifically (cache headers, 404 handling, Pretty URLs)
- Designed for React Router v6 with the StaticRouter/BrowserRouter split
- Islands-capable: dynamic client-only content via `<pre-island>` without touching the prerender pipeline
- Proxy-capable: optional bot-time dynamic rendering via VPS or CF Worker

## What Prestruct is not

- Not a full SSR framework (no server, no streaming, no edge runtime)
- Not a competitor to Remix, Astro, or TanStack Start
- Not suitable for apps needing per-request SSR for humans (this is build-time prerender + bot proxy)
- Not CMS-aware out of the box (routes are static config) - although it could be built

---

## P1: significantly improves usability (not yet done)

- [ ] **CLI scaffold tool.** `npx prestruct init` that copies files from `init/`
  into an existing Vite project and creates a starter `ssr.config.js`.
  Probably 100-150 lines of Node.

- [ ] **Config validation.** Check that `ssr.config.js` has all required fields
  before running. Emit clear errors for missing `siteUrl`, `appLayoutPath not found`, etc.
  Also validate `config.proxy.url` is a valid URL when set, and warn if `proxy.url`
  is set but `proxy.secret` is null (refresh disabled -- may be intentional, worth surfacing).

- [ ] **Dynamic route support.** Routes are fully static. Add support for an async
  `fetchRoutes()` function in config:
  ```js
  async fetchRoutes() {
    const posts = await fetch('https://cms.example.com/posts').then(r => r.json())
    return posts.map(p => ({
      path:       `/blog/${p.slug}`,
      priority:   '0.7',
      changefreq: 'monthly',
      meta: { title: p.title, description: p.excerpt },
    }))
  }
  ```

- [ ] **Per-route `og:image`.** Currently one global OG image. Support
  `meta.ogImage` per route so blog posts, product pages can have unique social images.
  (The inject logic already supports `meta.ogImage`. This is just documenting it.)

- [ ] **Worker bot list sync.** The Worker's `BOT_LIST` in `proxy.worker.js` is a
  manual copy of `config.proxy.botList`. A build step that writes the config value
  into the Worker file before `wrangler deploy` would remove the drift risk.

- [ ] **pm2 / systemd starters.** Include a sample `ecosystem.config.cjs` (pm2) and
  a sample `prestruct-proxy.service` (systemd) for VPS deployment. Currently
  documented in prose in README-proxy.md only.

---

## P2: polish

- [ ] **npm package setup.** `package.json` with `bin` for the CLI, `exports` for
  the hooks, `peerDependencies` (vite, react, react-router-dom).

- [ ] **GitHub Actions.** CI that runs a test build using the example config.
  Add a second workflow that deploys the Worker proxy on push to main via `wrangler deploy`.

- [x] **Example app.** The `/example` directory is the live reference app at prestruct.creadev.org. It auto-syncs
  from `init/` on each tagged release via GitHub Actions.

- [x] **Configurable 404 content.** Pass a `notFound` object in `ssr.config.js`
  with `heading`, `body`, and `primaryCta: { label, href }`. Implemented in prerender.js.

- [ ] **Robots.txt generation.** Currently a static file. Could be generated
  from config (inject sitemap URL, add/remove disallow rules automatically).

- [ ] **Cache stats endpoint.** A `GET /_prestruct/status` route on the VPS proxy
  returning cache entry count, total size, and oldest/newest entry timestamps.
  Useful for monitoring without SSH access.

---

## Decisions made

**Config format:** `ssr.config.js` (JS module). Supports functions (`buildJsonLd`,
future `fetchRoutes`). JSON would be simpler but can't express functions.

**usePageMeta distribution:** Ship as a file to copy. No package import needed.
The `siteUrl` is passed as a prop or read from env. No coupling to app config files.

**Vite version floor:** Vite 5. Vite 6 not yet tested.

**React version floor:** React 18. `hydrateRoot` requires React 18.

**Proxy runtime choice:** Two separate files, not a shared abstraction. The Node and
Worker environments are different enough that a unified layer adds indirection without
simplifying either implementation. See AGENTS.md for the full rationale.

---

## Keeping it simple

The value of this library is that it's thin and readable. A developer can read
prerender.js in 10 minutes and understand exactly what it does. If it grows into
a plugin system that handles every edge case, it loses that. Astro already exists.
Thanks for keeping it real.
