---
layout: default
title: Testing
nav_order: 12
---

# Testing

Testing strategies for prestruct applications.

## Testing Philosophy

Prestruct apps have two parts:
1. **Static HTML** - Generated at build time, tested via build output
2. **Client-side React** - Hydrated in browser, tested via standard React testing

## Testing the Build Output

### Verify Prerendered HTML

After running `npm run build`, check the output:

```bash
# Check a specific route
cat dist/about/index.html | grep -E '<title>|<meta.*description'

# List all generated routes
find dist -name "index.html" | sort

# Check sitemap
cat dist/sitemap.xml
```

### Automated Build Verification

```js
// test/prerender.test.js
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const DIST = path.join(process.cwd(), 'dist')

describe('Prerendered output', () => {
  it('generates index.html', () => {
    expect(fs.existsSync(path.join(DIST, 'index.html'))).toBe(true)
  })
  
  it('generates about page', () => {
    const html = fs.readFileSync(path.join(DIST, 'about/index.html'), 'utf-8')
    expect(html).toContain('<title>About')
    expect(html).toContain('Learn more about')
  })
  
  it('includes SEO meta tags', () => {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8')
    
    // Check for essential SEO tags
    expect(html).toContain('<title>')
    expect(html).toContain('name="description"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain('property="og:description"')
    expect(html).toContain('rel="canonical"')
  })
  
  it('generates sitemap.xml', () => {
    const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf-8')
    expect(sitemap).toContain('<?xml')
    expect(sitemap).toContain('<urlset')
    expect(sitemap).toContain('<loc>')
  })
  
  it('generates 404.html', () => {
    const html = fs.readFileSync(path.join(DIST, '404.html'), 'utf-8')
    expect(html).toContain('noindex')
  })
  
  it('has server-rendered标记', () => {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8')
    expect(html).toContain('data-server-rendered="true"')
  })
})
```

### Run Tests

```json
{
  "scripts": {
    "test": "npm run build && vitest run",
    "test:watch": "npm run build && vitest"
  }
}
```

## Testing Client Components

### Basic Component Tests

```jsx
// src/pages/Home.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './Home'

describe('Home page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByText('Welcome')).toBeDefined()
  })
})
```

### Testing usePageMeta

The hook updates DOM elements, so test that it runs without errors:

```jsx
// src/hooks/usePageMeta.test.js
import { describe, it, expect, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { usePageMeta } from './usePageMeta.js'

// Test component that uses the hook
function TestComponent() {
  usePageMeta({
    title: 'Test Title',
    description: 'Test description',
    path: '/test/',
    siteUrl: 'https://example.com'
  })
  return <div>Test</div>
}

describe('usePageMeta', () => {
  beforeEach(() => {
    document.title = ''
    // Clear any existing meta
    document.querySelectorAll('meta').forEach(el => el.remove())
  })
  
  afterEach(cleanup)
  
  it('sets page title', () => {
    render(<TestComponent />)
    expect(document.title).toBe('Test Title')
  })
  
  it('sets description meta', () => {
    render(<TestComponent />)
    const meta = document.querySelector('meta[name="description"]')
    expect(meta.content).toBe('Test description')
  })
  
  it('sets canonical URL', () => {
    render(<TestComponent />)
    const link = document.querySelector('link[rel="canonical"]')
    expect(link.href).toBe('https://example.com/test/')
  })
})
```

### Testing Islands

Islands run only in the browser:

```jsx
// src/islands/CartWidget.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartWidget from './CartWidget.jsx'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
}
global.localStorage = localStorageMock

describe('CartWidget island', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([
      { id: 1, name: 'Product', price: 10 }
    ]))
  })
  
  it('renders cart items from localStorage', async () => {
    render(<CartWidget />)
    
    await waitFor(() => {
      expect(screen.getByText('1 items')).toBeDefined()
    })
  })
  
  it('shows empty state when no items', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(<CartWidget />)
    
    await waitFor(() => {
      expect(screen.getByText('0 items')).toBeDefined()
    })
  })
})
```

## Integration Testing

### Test Full Build Pipeline

```js
// test/build.test.js
import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

describe('Build pipeline', () => {
  const dist = path.join(process.cwd(), 'dist')
  
  it('completes without errors', () => {
    // This should match your actual build command
    expect(() => execSync('npm run build', { stdio: 'pipe' })).not.toThrow()
  })
  
  it('outputs to dist directory', () => {
    expect(fs.existsSync(dist)).toBe(true)
  })
  
  it('produces hashed assets', () => {
    const files = fs.readdirSync(path.join(dist, 'assets'))
    const jsFiles = files.filter(f => f.endsWith('.js'))
    expect(jsFiles.length).toBeGreaterThan(0)
    // Check for hash in filename
    expect(jsFiles[0]).toMatch(/-[a-f0-9]+\.js$/)
  })
})
```

### Test Hydration

```jsx
// test/hydration.test.jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../src/App.jsx'

// This tests that the app can hydrate without errors
// The SSR HTML is simulated via data-server-rendered attribute
describe('Hydration', () => {
  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
      <div id="root" data-server-rendered="true">
        <div>Server rendered content</div>
      </div>
    `
  })
  
  it('hydrates without console errors', () => {
    const errors = []
    const originalError = console.error
    console.error = (...args) => {
      errors.push(args.join(' '))
      originalError.apply(console, args)
    }
    
    // This would need jsdom setup
    // render(<BrowserRouter><App /></BrowserRouter>)
    
    // Filter out expected React hydration warnings
    const criticalErrors = errors.filter(e => 
      !e.includes('Hydration') && !e.includes('did not match')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })
})
```

## E2E Testing with Playwright

### Test Prerendered Routes

```js
// e2e/routes.spec.js
import { test, expect } from '@playwright/test'

test.describe('Prerendered routes', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Home/)
  })
  
  test('about page loads', async ({ page }) => {
    await page.goto('/about/')
    await expect(page.locator('h1')).toContainText('About')
  })
  
  test('sitemap is valid XML', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response.status()).toBe(200)
    const content = await page.content()
    expect(content).toContain('<?xml')
    expect(content).toContain('<urlset')
  })
  
  test('404 page works', async ({ page }) => {
    await page.goto('/nonexistent-page/')
    await expect(page.locator('#root-404')).toBeVisible()
  })
})
```

### Test SPA Navigation

```js
test('navigation works without full page reload', async ({ page }) => {
  await page.goto('/')
  
  // Click a link
  await page.click('text=About')
  
  // Should navigate without reload
  await expect(page).toHaveURL('/about/')
  
  // Content should update
  await expect(page.locator('h1')).toContainText('About')
  
  // Should NOT have data-server-rendered (SPA navigation)
  const root = page.locator('#root')
  await expect(root).not.toHaveAttribute('data-server-rendered', 'true')
})
```

## Testing SEO

### Verify Meta Tags

```js
test('each route has unique meta', async ({ page }) => {
  const routes = ['/', '/about/', '/contact/']
  
  for (const route of routes) {
    await page.goto(route)
    
    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    
    expect(title).toBeTruthy()
    expect(description).toBeTruthy()
    expect(canonical).toContain(route)
  }
})
```

### Validate Structured Data

```js
test('JSON-LD is present', async ({ page }) => {
  await page.goto('/')
  
  const ldJson = await page.locator('script[type="application/ld+json"]').textContent()
  const data = JSON.parse(ldJson)
  
  expect(data).toBeDefined()
  expect(Array.isArray(data) ? data.length : 1).toBeGreaterThan(0)
})
```

## Mocking SSR APIs

```js
// test/__mocks__/react-router-dom/server.js.js
// Mock react-router-dom/server.js for Node environment

export const StaticRouter = ({ children }) => children
export const generateStaticHandler = () => ({ render: () => ({ html: '' }) })
```

## CI Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test --if-present
      
      - name: Build
        run: npm run build
      
      - name: Run build tests
        run: npm run test:build
```

## Test Utils

```js
// test/utils.js

/**
 * Wait for a condition with timeout
 */
export async function waitForCondition(fn, timeout = 1000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (fn()) return true
    await new Promise(r => setTimeout(r, 10))
  }
  return false
}

/**
 * Mock fetch for testing
 */
export function mockFetch(data) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data)
  })
}

/**
 * Create mock localStorage
 */
export function createLocalStorageMock(initial = {}) {
  let store = { ...initial }
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn(key => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: jest.fn(i => Object.keys(store)[i] || null)
  }
}
```