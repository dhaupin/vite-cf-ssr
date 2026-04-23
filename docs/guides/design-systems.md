---
layout: default
title: Design Systems
nav_order: 24
---

# Design Systems

Building and integrating design systems with prestruct.

## What is a Design System?

A design system is a collection of reusable components, guided by clear standards:

- **Components** - Buttons, forms, cards, etc.
- **Design tokens** - Colors, spacing, typography
- **Patterns** - Common layouts and interactions
- **Documentation** - Usage guidelines

## CSS Architecture

### Approach Options

| Approach | Pros | Cons |
|---------|------|------|
| **CSS Modules** | Scoped, no conflicts | Limited theming |
| **Tailwind** | Fast development | Learning curve |
| **CSS Variables** | Dynamic theming | Browser support |
| **CSS-in-JS** | Co-located | SSR complexity |

### Recommended for Prestruct

**CSS Variables + CSS Modules:**

```css
/* global.css */
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-primary-hover: #0052a3;
  --color-text: #1a1a1a;
  --color-text-muted: #666666;
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Import in Vite

```js
// main.jsx or App.jsx
import './global.css'
```

## Component Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   ├── Button.stories.jsx
│   │   └── index.js
│   ├── Card/
│   └── Input/
├── styles/
│   ├── global.css
│   └── tokens.css
└── App.jsx
```

## Button Component Example

```jsx
// components/Button/Button.jsx
import styles from './Button.module.css'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  type = 'button'
}) {
  return (
    <button
      type={type}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${disabled ? styles.disabled : ''}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

```css
/* components/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.primary {
  background: var(--color-primary);
  color: white;
}

.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
}

.md {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-base);
}

.lg {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-size-lg);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Theming

### Light/Dark Mode

```css
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
}

[data-theme="dark"] {
  --color-background: #1a1a1a;
  --color-text: #ffffff;
}
```

```jsx
// ThemeToggle component
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }
  
  return (
    <button onClick={toggle}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

### CSS Variables for All Tokens

```css
:root {
  /* Semantic tokens */
  --color-bg-primary: var(--color-background);
  --color-bg-secondary: var(--color-surface);
  --color-text-primary: var(--color-text);
  --color-text-secondary: var(--color-text-muted);
  
  /* Component tokens */
  --button-bg: var(--color-primary);
  --button-color: white;
  --input-border: var(--color-border);
  --card-shadow: var(--shadow-md);
}
```

## UI Library Integration

### Radix UI (Headless)

```bash
npm install @radix-ui/react-button @radix-ui/react-dialog
```

```jsx
import * as Dialog from '@radix-ui/react-dialog'
import './dialog.css'

export function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="content">
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Description>Description</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Headless UI (Tailwind)

```bash
npm install @headlessui/react
```

### Shadcn/ui (Recommended)

Based on Radix + Tailwind:

```bash
# npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input
```

Components live in your repo - full control.

## Storybook Integration

### Setup

```bash
npm install -D @storybook/react @storybook/react-vite storybook
```

```json
// package.json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Example Story

```jsx
// Button.stories.jsx
import Button from './Button'

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost']
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg']
    },
    disabled: { control: 'boolean' }
  }
}

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button'
  }
}

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Button'
  }
}
```

## Distribution

### As npm Package

```
design-system/
├── dist/
│   ├── index.js
│   ├── index.css
│   └── components/
├── src/
└── package.json
```

```json
{
  "name": "@myorg/design-system",
  "main": "dist/index.js",
  "style": "dist/index.css",
  "peerDependencies": {
    "react": ">=18"
  }
}
```

### Monorepo

```
packages/
├── design-system/
│   ├── src/
│   └── package.json
├── app/
│   ├── src/
│   └── package.json
└── shared/
```

## Checklist

- [ ] Define design tokens (colors, spacing, type)
- [ ] Create base component library
- [ ] Add CSS modules for scoping
- [ ] Support light/dark theme
- [ ] Document components with Storybook
- [ ] Consider Tailwind or Radix UI
- [ ] Version and publish if sharing