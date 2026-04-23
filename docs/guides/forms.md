---
layout: default
title: Forms & Data
nav_order: 27
---

# Forms & Data

Form handling, validation, and data fetching with prestruct.

## Form Handling

### Controlled Components

```jsx
// src/pages/Contact.jsx
import { useState } from 'react'
import usePageMeta from '../hooks/usePageMeta.js'

export default function Contact() {
  usePageMeta({
    path: '/contact/',
    title: 'Contact | My Site',
    description: 'Get in touch with us.',
  })

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle, submitting, success, error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed')

      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Send'}
      </button>

      {status === 'success' && <p>Message sent!</p>}
      {status === 'error' && <p>Something went wrong.</p>}
    </form>
  )
}
```

## Validation

### HTML5 Validation

```jsx
<input type="email" required pattern="[a-z]+@[a-z]+\.[a-z]+" />
<input type="url" />
<input type="tel" pattern="[0-9]{10}" />
```

### Custom Validation

```jsx
function validate(form) {
  const errors = {}

  if (!form.name || form.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email address'
  }

  if (!form.message || form.message.length < 10) {
    errors.message = 'Message must be at least 10 characters'
  }

  return errors
}

function Form() {
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    // Submit
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {errors.name && <span className="error">{errors.name}</span>}
    </form>
  )
}
```

### Use a Library (Zod + React Hook Form)

```bash
npm install react-hook-form @hookform/resolvers zod
```

```jsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <textarea {...register('message')} />
      {errors.message && <p>{errors.message.message}</p>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
```

## Data Fetching

### Simple Fetch

```jsx
import { useState, useEffect } from 'react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/users')
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### SWR (Recommended)

```bash
npm install swr
```

```jsx
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function Users() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher)

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading users</p>

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### React Query

```bash
npm install @tanstack/react-query
```

```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  )
}

function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()),
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  return <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
}
```

## Server Actions

### API Route

```js
// functions/api/contact.js
export async function onRequestPost({ request, env }) {
  const data = await request.formData()

  const name = data.get('name')
  const email = data.get('email')
  const message = data.get('message')

  // Validate
  if (!name || !email || !message) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Save to D1/KV/database
  await env.DB.prepare(
    'INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)'
  ).bind(name, email, message).run()

  return Response.json({ success: true })
}
```

### Optimistic Updates

```jsx
function AddTodo() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  const addTodo = async () => {
    const tempId = Date.now()
    const tempTodo = { id: tempId, text, completed: false }

    // Optimistic update
    setTodos([...todos, tempTodo])

    try {
      await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
    } catch {
      // Rollback on error
      setTodos(todos.filter((t) => t.id !== tempId))
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); addTodo() }}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button>Add</button>
    </form>
  )
}
```

## File Uploads

### Client

```jsx
function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
    </form>
  )
}
```

### Server (R2)

```js
// functions/api/upload.js
export async function onRequestPost({ request, env }) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!file) {
    return new Response('No file', { status: 400 })
  }

  await env.R2.put(file.name, file.stream())

  return Response.json({ url: `/files/${file.name}` })
}
```

## Loading States

### Skeleton Screens

```jsx
function UserList() {
  const { data } = useSWR('/api/users', fetcher)

  if (!data) {
    return (
      <div className="skeleton">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    )
  }

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Progress Bar

```jsx
function UploadWithProgress() {
  const [progress, setProgress] = useState(0)

  const upload = () => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      setProgress((e.loaded / e.total) * 100)
    })
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  }

  return (
    <div>
      <progress value={progress} max={100} />
      <p>{Math.round(progress)}%</p>
    </div>
  )
}
```

## Error Handling

### Error Boundaries

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Use in AppLayout:
```jsx
<ErrorBoundary>
  <Routes>{/* routes */}</Routes>
</ErrorBoundary>
```

## Checklist

- [ ] Use controlled components for forms
- [ ] Validate on client and server
- [ ] Show loading and error states
- [ ] Use SWR or React Query for data fetching
- [ ] Handle optimistic updates
- [ ] Use error boundaries