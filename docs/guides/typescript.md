---
layout: default
title: TypeScript
nav_order: 29
---

# TypeScript

Adding TypeScript to your prestruct project.

## Setup

### Install TypeScript

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

### Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Create tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### Update vite.config.js → vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Type Your Components

### Basic Props

```tsx
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick,
  disabled = false 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### With Events

```tsx
interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function Input({ value, onChange, placeholder }: InputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}
```

### With Generics

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Usage
<List 
  items={['a', 'b', 'c']} 
  renderItem={(item) => <span>{item}</span>}
/>
```

## Type SSR Config

### ssr.config.ts

```ts
interface RouteMeta {
  title: string
  description?: string
  ogImage?: string
  noindex?: boolean
}

interface Route {
  path: string
  priority?: string
  changefreq?: string
  meta: RouteMeta
}

interface Config {
  siteUrl: string
  siteName?: string
  author?: string
  tagline?: string
  ogImage?: string
  keywords?: string
  appLayoutPath?: string
  routes: Route[]
  buildJsonLd?: () => Record<string, unknown>[]
}

export default {
  siteUrl: 'https://example.com',
  siteName: 'My Site',
  routes: [
    { path: '/', meta: { title: 'Home' } }
  ]
} satisfies Config
```

## Type usePageMeta

### Hook Types

```tsx
// src/hooks/usePageMeta.ts
interface PageMetaOptions {
  title: string
  description?: string
  path: string
  siteUrl?: string
}

export function usePageMeta(options: PageMetaOptions): void
```

### Usage with Types

```tsx
import usePageMeta from './hooks/usePageMeta'

function About() {
  usePageMeta({
    path: '/about/',
    title: 'About | My Site',
    description: 'Learn more about us',
    // siteUrl is inferred or optional
  })
}
```

## Type Islands

### Island Component

```tsx
// src/islands/CartWidget.tsx
interface CartItem {
  id: string
  name: string
  price: number
}

export default function CartWidget() {
  const [items, setItems] = useState<CartItem[]>([])

  // ... component logic
}
```

### Registry

```tsx
// src/AppIslands.tsx
import CartWidget from './islands/CartWidget'
import RecentlyViewed from './islands/RecentlyViewed'

export const islands = {
  'cart-widget': CartWidget,
  'recently-viewed': RecentlyViewed,
} as const

export type IslandName = keyof typeof islands
```

## Type Your API

### API Response Types

```tsx
// src/types/api.ts
interface User {
  id: string
  name: string
  email: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

// Fetch with types
async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users')
  const json = await res.json() as ApiResponse<User[]>
  
  if (json.error) {
    throw new Error(json.error)
  }
  
  return json.data ?? []
}
```

### Use in Components

```tsx
function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Strict Mode

### Recommended Config

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Fix Common Issues

```tsx
// Problem: Parameter is 'any'
function greet(name) { }

// Fix: Add type
function greet(name: string) {
  return `Hello, ${name}`
}

// Problem: Could be undefined
const user = users.find(u => u.id === id)
console.log(user.name) // Error

// Fix: Optional chaining or null check
console.log(user?.name)

// Problem: Function doesn't always return a value
function getStatus(ok: boolean) {
  if (ok) return 'ok'
  // Error: not all code paths return a value
}

// Fix: Explicit return
function getStatus(ok: boolean): string {
  if (ok) return 'ok'
  return 'error'
}
```

## Type Utilities

### Common Utilities

```tsx
// Make all properties optional
type Partial<T>

// Make all properties required
type Required<T>

// Make all properties readonly
type Readonly<T>

// Extract function parameters
type Parameters<T>

// Extract return type
type ReturnType<T>

// Get array element type
type ArrayElement<T extends unknown[]> = T[number]

// Usage
type User = { id: string; name: string }
type PartialUser = Partial<User>  // { id?: string; name?: string }
```

### Custom Utilities

```tsx
// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Usage
type CreateUser = PartialBy<User, 'id'>  // id is optional for creation

// Make specific properties required
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>
```

## Migration Tips

### Rename Files

```
Button.jsx → Button.tsx
App.jsx → App.tsx
```

### Fix Errors Incrementally

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

Then enable gradually as you fix issues.

### Use `any` Sparingly

```tsx
// Bad
const data: any = fetchData()

// Better - type unknown first, then narrow
const data: unknown = fetchData()
if (isUser(data)) {
  console.log(data.name)
}
```

## Checklist

- [ ] Install TypeScript and types
- [ ] Create tsconfig.json
- [ ] Enable strict mode
- [ ] Type component props
- [ ] Type API responses
- [ ] Add types to hooks
- [ ] Rename files to .tsx gradually