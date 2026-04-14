/**
 * ssr.config.js
 * =============
 * Your app's SSR configuration. Lives in the project root.
 * Read by scripts/inject-brand.js and scripts/prerender.js at build time.
 * Read by scripts/proxy.js at runtime (VPS or Cloudflare Worker).
 *
 * This is the only file you edit to configure the prerender layer.
 * The engine scripts (prerender.js, inject-brand.js, usePageMeta.js, proxy.js)
 * never need to change.
 */

export default {

  // ── Site identity ──────────────────────────────────────────────────────────
  // Used in <title>, OG tags, Twitter Card, JSON-LD, and sitemap.

  siteUrl:  'https://yoursite.com',   // no trailing slash
  siteName: 'Your Site',
  author:   'Your Org',
  tagline:  'Your tagline.',          // appended to siteName in global <title>
  ogImage:  'https://yoursite.com/og-image.jpg',
  keywords: 'keyword one, keyword two, keyword three',

  // ── App entry ──────────────────────────────────────────────────────────────
  // Path to AppLayout -- the component that wraps Routes but NOT BrowserRouter.
  // ssrLoadModule imports this file. Its entire module graph must be BrowserRouter-free.

  appLayoutPath: '/src/AppLayout.jsx',

  // ── Render proxy ──────────────────────────────────────────────────────────
  // Optional. Enables bot-time dynamic rendering in addition to build-time prerender.
  //
  // url:       Public URL of your proxy. Added to CSP connect-src automatically.
  //            Set to null to disable proxy mode entirely.
  //
  // secret:    Shared secret for the x-prestruct-refresh header.
  //            Must match PRESTRUCT_SECRET env var on the proxy host.
  //            Set to null to disable cache-refresh entirely.
  //
  // targetUrl: The site the proxy actually renders. Defaults to siteUrl when null.
  //            Override to point the proxy at a different origin (e.g. a WordPress
  //            site, a staging URL, or localhost:5173 for local dev).
  //
  // botList:   User-agent substrings that trigger a proxy render instead of a
  //            redirect. Case-insensitive. Matches are partial -- 'googlebot'
  //            matches 'Mozilla/5.0 (compatible; Googlebot/2.1...)'.

  proxy: {
    url:       null,   // e.g. 'https://proxy.yoursite.com' or 'https://your-proxy.workers.dev'
    secret:    null,   // e.g. 'a-long-random-string'  (set same value as PRESTRUCT_SECRET env)
    targetUrl: null,   // defaults to siteUrl when null
    botList: [
      'googlebot',
      'bingbot',
      'slurp',
      'duckduckbot',
      'baiduspider',
      'yandexbot',
      'twitterbot',
      'facebookexternalhit',
      'discordbot',
      'linkedinbot',
      'slackbot',
      'telegrambot',
      'whatsapp',
    ],
  },

  // ── Routes ─────────────────────────────────────────────────────────────────
  // One entry per prerendered route.
  // Unlisted routes won't be prerendered and won't appear in sitemap.xml.
  //
  // String values containing apostrophes must use double quotes:
  //   description: "We're based in..."   (correct)
  //   description: 'We're based in...'   (parse error)

  routes: [
    {
      path:       '/',
      priority:   '1.0',
      changefreq: 'weekly',
      meta: {
        title:       'Your Site | Your tagline.',
        description: 'Homepage description. 50-160 characters.',
        // ogImage: 'https://yoursite.com/home-og.jpg',  // optional per-route override
      },
    },
    {
      path:       '/about',
      priority:   '0.9',
      changefreq: 'monthly',
      meta: {
        title:       'About | Your Site',
        description: 'About page description.',
      },
    },
    {
      path:       '/contact',
      priority:   '0.6',
      changefreq: 'yearly',
      meta: {
        title:       'Contact | Your Site',
        description: 'Contact page description.',
      },
    },
  ],

  // ── JSON-LD structured data ────────────────────────────────────────────────
  // Injected into every page's <head> by inject-brand.js.
  // Return an array of schema.org objects, or an empty array to skip.
  // See https://schema.org for type references.

  buildJsonLd() {
    return [
      {
        '@context': 'https://schema.org',
        '@type':    'Organization',
        name:       'Your Org',
        url:        'https://yoursite.com',
        logo:       'https://yoursite.com/logo.png',
        description: 'Your org description.',
      },
      {
        '@context': 'https://schema.org',
        '@type':    'WebSite',
        url:        'https://yoursite.com',
        name:       'Your Site',
      },
    ]
  },

  // ── 404 page content (optional) ────────────────────────────────────────────
  // Customize the 404 page without editing prerender.js.
  // Omit this block to use the defaults.

  // notFound: {
  //   heading:  'Page not found.',
  //   body:     "That page doesn't exist -- or it moved.",
  //   primaryCta: { label: 'Go home', href: '/' },
  // },

  // ── Dynamic routes (not yet implemented) ──────────────────────────────────
  // Uncomment and implement fetchRoutes() to pull routes from a CMS or API.
  // Return the same shape as the static routes array above.
  //
  // async fetchRoutes() {
  //   const posts = await fetch('https://your-cms.com/api/posts').then(r => r.json())
  //   return posts.map(post => ({
  //     path:       `/blog/${post.slug}`,
  //     priority:   '0.7',
  //     changefreq: 'monthly',
  //     meta: {
  //       title:       `${post.title} | Your Site`,
  //       description: post.excerpt,
  //       ogImage:     post.heroImage,
  //     },
  //   }))
  // },

}
