---
layout: default
title: Edge Functions
nav_order: 23
---

# Edge Functions

Cloudflare Pages Functions for dynamic content at the edge.

## What Are Edge Functions?

Pages Functions run on Cloudflare's edge network, close to users. They handle dynamic requests that can't be prerendered:

- API endpoints
- Form processing  
- Auth callbacks
- A/B testing
- Dynamic routing

## Quick Start

### Create Function File

```js
// functions/api/hello.js
export function onRequestGet({ request }) {
  return new Response(JSON.stringify({
    message: 'Hello from the edge!',
    region: request.cf?.country || 'unknown'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### File-Based Routing

```
functions/
├── api/
│   ├── hello.js      → /api/hello
│   └── users.js      → /api/users
├── [catchall].js     → /anything (catch-all)
└── index.js          → /
```

### HTTP Methods

```js
export function onRequestGet({ request, params })    { }  // GET
export function onRequestPost({ request, params })   { }  // POST
export function onRequestPut({ request, params })    { }  // PUT
export function onRequestPatch({ request, params })  { }  // PATCH
export function onRequestDelete({ request, params }) { }  // DELETE
```

## Request Object

```js
export function onRequestGet({ request, params, env, context }) {
  // request: Fetch API Request object
  // params: Dynamic route parameters
  // env: Environment variables
  // context: WaitUntil promise for async work
  
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const country = request.cf?.country
  const city = request.cf?.city
  
  return new Response(`Hello from ${city}, ${country}`)
}
```

## Response Helpers

```js
export function onRequestGet({ request }) {
  // JSON response
  return Response.json({ ok: true })
  
  // Redirect
  return new Response(null, { status: 302, headers: { Location: '/new' }})
  
  // Error
  return new Response('Not found', { status: 404 })
}
```

## Environment Variables

### In wrangler.toml

```toml
[vars]
API_URL = "https://api.example.com"
```

### In Pages Settings

Add variables in Cloudflare Dashboard → Pages → Your project → Settings → Environment variables.

### In Function

```js
export function onRequestGet({ env }) {
  const apiUrl = env.API_URL
  return new Response(apiUrl)
}
```

### Secrets

```bash
# Set secret
wrangler secret put DATABASE_URL
# Enter value when prompted

# Use in function
export function onRequestGet({ env }) {
  const dbUrl = env.DATABASE_URL  // From secret
}
```

## Database Integration

### D1 (SQLite)

```js
export async function onRequestGet({ env }) {
  const stmt = await env.DB.prepare('SELECT * FROM users LIMIT 10')
  const { results } = await stmt.all()
  
  return Response.json(results)
}
```

wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xxx"
```

### KV

```js
export async function onRequestGet({ env, params }) {
  const key = params.key
  const value = await env.KV.get(key)
  
  if (!value) {
    return new Response('Not found', { status: 404 })
  }
  
  return new Response(value)
}
```

wrangler.toml:
```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"
```

### R2 (Storage)

```js
export async function onRequestGet({ env, params }) {
  const object = await env.R2.get(params.file)
  
  if (!object) {
    return new Response('Not found', { status: 404 })
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata.contentType || 'application/octet-stream'
    }
  })
}
```

## Form Handling

```js
export async function onRequestPost({ request, env }) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')
  
  // Validate
  if (!name || !email) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  
  // Save to D1
  await env.DB.prepare(
    'INSERT INTO submissions (name, email) VALUES (?, ?)'
  ).bind(name, email).run()
  
  return Response.json({ success: true })
}
```

## Authentication

### Simple Token Check

```js
export function onRequestGet({ request, env }) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const token = authHeader.slice(7)
  
  if (token !== env.API_TOKEN) {
    return new Response('Invalid token', { status: 403 })
  }
  
  return Response.json({ data: 'secret' })
}
```

### OAuth Callback

```js
// functions/auth/callback.js
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  // Exchange code for token
  const tokenResponse = await fetch('https://oauth.provider/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      redirect_uri: env.OAUTH_REDIRECT_URI,
    })
  })
  
  const tokens = await tokenResponse.json()
  
  // Create session
  const session = await createSession(tokens, env)
  
  // Redirect with cookie
  const response = new Response(null, {
    status: 302,
    headers: { Location: '/dashboard' }
  })
  
  response.headers.set('Set-Cookie', `session=${session.id}; HttpOnly; Path=/`)
  
  return response
}
```

## A/B Testing

```js
export function onRequestGet({ request, cookies }) {
  // Check for existing variant
  let variant = cookies.get('ab-test')?.value
  
  if (!variant) {
    // Assign random variant
    variant = Math.random() < 0.5 ? 'a' : 'b'
  }
  
  const response = new Response(`Variant ${variant}`)
  
  // Set cookie if new
  if (!cookies.get('ab-test')) {
    response.headers.set('Set-Cookie', `ab-test=${variant}; Path=/`)
  }
  
  return response
}
```

## Rate Limiting

```js
export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP')
  const key = `ratelimit:${ip}`
  
  const current = await env.RATELIMIT.get(key)
  const count = parseInt(current || '0')
  
  if (count >= 10) {
    return new Response('Too many requests', { status: 429 })
  }
  
  await env.RATELIMIT.put(key, String(count + 1), { expirationTtl: 60 })
  
  return Response.json({ remaining: 10 - count - 1 })
}
```

## CORS

```js
export function onRequestOptions({ request }) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export function onRequestGet({ request }) {
  const response = Response.json({ ok: true })
  
  // Add CORS headers to response
  response.headers.set('Access-Control-Allow-Origin', '*')
  
  return response
}
```

## Static + Functions Fallback

When prerendered HTML doesn't exist, Functions handle the request:

```
/about/         → Static HTML (prerendered)
/api/data       → Function
/blog/          → Static HTML (prerendered)
/blog/post-1/   → Function (not prerendered)
```

## Testing Locally

```bash
# Run local dev server with functions
npx wrangler pages dev dist
```

## Limits

- **Execution time:** 10-50 ms (CPU)
- **Memory:** 128 MB
- **Request size:** 100 MB
- **Response size:** 100 MB

## Checklist

- [ ] Use for dynamic content only
- [ ] Keep functions lightweight
- [ ] Use D1/KV for persistence
- [ ] Handle errors gracefully
- [ ] Add CORS headers when needed