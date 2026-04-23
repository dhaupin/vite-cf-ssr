---
layout: default
title: Authentication
nav_order: 28
---

# Authentication

User authentication patterns for prestruct apps.

## Authentication Options

| Method | Use Case | Complexity |
|--------|----------|------------|
| **Session-based** | Traditional web apps | Medium |
| **JWT** | APIs, SPAs | Medium |
| **OAuth/Social** | Social login | Easy |
| **Magic Links** | Passwordless | Easy |

## Session-Based Auth

### Login Flow

```jsx
// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      navigate('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Server-Side Session

```js
// functions/api/auth/login.js
import { createCookieSessionStorage } from '@remix-run/node'

const storage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
})

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json()

  // Validate credentials
  const user = await validateUser(email, password)
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Create session
  const session = await storage.getSession()
  session.set('userId', user.id)

  const response = Response.json({ success: true })
  response.headers.set(
    'Set-Cookie',
    await storage.commitSession(session)
  )

  return response
}
```

### Auth Check Hook

```jsx
// src/hooks/useAuth.js
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, loggedIn: !!user }
}
```

### Protected Route

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Usage
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## JWT Auth

### Issue Token

```js
// functions/api/auth/login.js
import jwt from 'jsonwebtoken'

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json()

  const user = await validateUser(email, password)
  if (!user) {
    return Response.json({ error: 'Invalid' }, { status: 401 })
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return Response.json({ token })
}
```

### Verify Token

```js
// functions/api/auth/me.js
import jwt from 'jsonwebtoken'

export async function onRequestGet({ request, env }) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'No token' }, { status: 401 })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    return Response.json({ user: decoded })
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

### Client Token Storage

```jsx
// Store in memory (recommended for security)
const [token, setToken] = useState(null)

// Or httpOnly cookie (set by server)
```

## OAuth / Social Login

### GitHub Example

```js
// functions/api/auth/github.js
export function onRequestGet({ request, env, redirect }) {
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  githubAuthUrl.searchParams.set('redirect_uri', `${env.APP_URL}/api/auth/github/callback`)
  githubAuthUrl.searchParams.set('scope', 'user:email')

  return redirect(githubAuthUrl.toString())
}

export async function onRequestGet({ request, env, params }) {
  const { code } = params

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const { access_token } = await tokenRes.json()

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  const user = await userRes.json()

  // Create or find user in your DB
  const dbUser = await upsertUser({ githubId: user.id, email: user.email, name: user.name })

  // Create session
  // ... set cookie

  return redirect('/dashboard')
}
```

### Auth.js (NextAuth Alternative)

```bash
npm install @auth/core
```

```js
// functions/api/auth/[...auth].js
import { Auth } from '@auth/core'
import GitHub from '@auth/core/providers/github'

export const onRequest = (event) =>
  Auth(event.request, {
    providers: [
      GitHub({
        clientId: event.env.GITHUB_ID,
        clientSecret: event.env.GITHUB_SECRET,
      }),
    ],
    secret: event.env.AUTH_SECRET,
  })
```

## Magic Links

### Send Magic Link

```js
// functions/api/auth/magic-link.js
export async function onRequestPost({ request, env }) {
  const { email } = await request.json()

  // Generate token
  const token = crypto.randomBytes(32).toString('hex')

  // Save token with expiry
  await env.KV.put(`magic:${token}`, email, { expirationTtl: 3600 })

  // Send email
  const magicLink = `https://example.com/auth/verify?token=${token}`

  await sendEmail(email, magicLink)

  return Response.json({ sent: true })
}
```

### Verify Token

```js
// functions/api/auth/verify.js
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  const email = await env.KV.get(`magic:${token}`)

  if (!email) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Delete token
  await env.KV.delete(`magic:${token}`)

  // Create session
  const session = await createSession(email)

  return Response.json({ session })
}
```

## Password Reset

### Request Reset

```js
// functions/api/auth/forgot-password.js
export async function onRequestPost({ request, env }) {
  const { email } = await request.json()

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex')

  // Save token
  await env.KV.put(`reset:${token}`, email, { expirationTtl: 3600 })

  // Send email with link
  const resetLink = `https://example.com/auth/reset?token=${token}`

  await sendEmail(email, resetLink)

  return Response.json({ ok: true })
}
```

### Reset Password

```js
// functions/api/auth/reset-password.js
export async function onRequestPost({ request, env }) {
  const { token, password } = await request.json()

  const email = await env.KV.get(`reset:${token}`)

  if (!email) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Hash new password
  const hash = await bcrypt.hash(password, 10)

  // Update user
  await env.DB.prepare(
    'UPDATE users SET password = ? WHERE email = ?'
  ).bind(hash, email).run()

  // Delete token
  await env.KV.delete(`reset:${token}`)

  return Response.json({ ok: true })
}
```

## Password Best Practices

### Hashing

```js
// Never store plain passwords!
import bcrypt from 'bcrypt'

// Hash when creating/updating
const hash = await bcrypt.hash(password, 12)

// Verify
const valid = await bcrypt.compare(password, hash)
```

### Validation

```js
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain uppercase'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain lowercase'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain number'
  }
}
```

## Logout

```js
// functions/api/auth/logout.js
export async function onRequestPost({ request }) {
  const session = await getSession(request)

  const response = Response.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    `session=; Path=/; HttpOnly; Max-Age=0`
  )

  return response
}
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure, httpOnly cookies
- [ ] Hash passwords with bcrypt (cost 10+)
- [ ] Implement CSRF protection
- [ ] Rate limit login attempts
- [ ] Use secure session secrets
- [ ] Implement logout (clear session)
- [ ] Set appropriate cookie expiry