/**
 * CodeBlock.jsx
 * Shared syntax-highlighted code block. Used by ViewSource, About, Deploy.
 * Renders React elements -- no dangerouslySetInnerHTML, no regex fighting.
 *
 * Props:
 *   children  string  the raw code string
 *   lang      string  'html' | 'js' | 'sh' (default 'js')
 *   label     string  optional bar label (e.g. 'ssr.config.js')
 */

import { useState } from 'react'

// Token types -> CSS classes
const T = {
  TAG:   'tok-tag',
  ATTR:  'tok-attr',
  VAL:   'tok-val',
  KW:    'tok-kw',
  FN:    'tok-fn',
  STR:   'tok-str',
  CMT:   'tok-cmt',
  NUM:   'tok-num',
  PUNCT: 'tok-punct',
  PLAIN: 'tok-plain',
}

// ── HTML tokenizer ────────────────────────────────────────────────────────────
function tokenizeTag(tag, tokens) {
  const isClose  = tag.startsWith('</')
  const selfClose = tag.endsWith('/>')
  const inner = tag.slice(isClose ? 2 : 1, selfClose ? -2 : -1).trim()
  const spaceIdx = inner.search(/\s/)
  const tagName  = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)
  const rest     = spaceIdx === -1 ? ''    : inner.slice(spaceIdx)

  tokens.push({ type: T.PLAIN, text: isClose ? '</' : '<' })
  tokens.push({ type: T.TAG,   text: tagName })

  if (rest) {
    // parse attr=value pairs
    const attrRe = /([\w:-]+)(?:=("[^"]*"|'[^']*'))?/g
    let lastEnd = 0
    let m
    while ((m = attrRe.exec(rest)) !== null) {
      if (m.index > lastEnd)
        tokens.push({ type: T.PLAIN, text: rest.slice(lastEnd, m.index) })
      tokens.push({ type: T.ATTR, text: m[1] })
      if (m[2]) {
        tokens.push({ type: T.PLAIN, text: '=' })
        tokens.push({ type: T.VAL,  text: m[2] })
      }
      lastEnd = m.index + m[0].length
    }
    if (lastEnd < rest.length)
      tokens.push({ type: T.PLAIN, text: rest.slice(lastEnd) })
  }

  tokens.push({ type: T.PLAIN, text: selfClose ? ' />' : '>' })
}

function tokenizeHtml(code) {
  const tokens = []
  let i = 0
  while (i < code.length) {
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i)
      const raw = end === -1 ? code.slice(i) : code.slice(i, end + 3)
      tokens.push({ type: T.CMT, text: raw })
      i += raw.length
      continue
    }
    if (code[i] === '<') {
      const end = code.indexOf('>', i)
      if (end === -1) { tokens.push({ type: T.PLAIN, text: code.slice(i) }); break }
      tokenizeTag(code.slice(i, end + 1), tokens)
      i = end + 1
      continue
    }
    const next = code.indexOf('<', i)
    const raw  = next === -1 ? code.slice(i) : code.slice(i, next)
    if (raw) tokens.push({ type: T.PLAIN, text: raw })
    i += raw.length
    if (next === -1) break
  }
  return tokens
}

// ── JS tokenizer ──────────────────────────────────────────────────────────────
const JS_KW = new Set(['import','export','default','from','const','let','var',
  'function','return','if','else','typeof','null','undefined','true','false',
  'new','class','extends','async','await','for','while','of','in','throw'])

function tokenizeJs(code) {
  const tokens = []
  let i = 0
  while (i < code.length) {
    // line comment
    if (code.startsWith('//', i)) {
      const end = code.indexOf('\n', i)
      const raw = end === -1 ? code.slice(i) : code.slice(i, end)
      tokens.push({ type: T.CMT, text: raw }); i += raw.length; continue
    }
    // string
    const q = code[i]
    if (q === '"' || q === "'" || q === '`') {
      let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === q)    { j++;    break }
        j++
      }
      tokens.push({ type: T.STR, text: code.slice(i, j) }); i = j; continue
    }
    // number
    if (/[0-9]/.test(code[i])) {
      let j = i
      while (j < code.length && /[\d._]/.test(code[j])) j++
      tokens.push({ type: T.NUM, text: code.slice(i, j) }); i = j; continue
    }
    // punctuation
    if ('{}()[];,'.includes(code[i])) {
      tokens.push({ type: T.PUNCT, text: code[i] }); i++; continue
    }
    // word
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[\w$]/.test(code[j])) j++
      const word = code.slice(i, j)
      tokens.push({ type: JS_KW.has(word) ? T.KW : code[j] === '(' ? T.FN : T.PLAIN, text: word })
      i = j; continue
    }
    tokens.push({ type: T.PLAIN, text: code[i] }); i++
  }
  return tokens
}

// ── Shell tokenizer ───────────────────────────────────────────────────────────
function tokenizeSh(code) {
  return code.split('\n').flatMap((line, li, arr) => {
    const toks = []
    if (line.startsWith('#')) {
      toks.push({ type: T.CMT, text: line })
    } else {
      const words = line.split(/(\s+)/)
      let first = true
      for (const w of words) {
        if (/^\s+$/.test(w)) { toks.push({ type: T.PLAIN, text: w }); continue }
        if (first)            { toks.push({ type: T.FN,    text: w }); first = false; continue }
        if (w.startsWith('-')){ toks.push({ type: T.ATTR,  text: w }); continue }
        toks.push({ type: T.PLAIN, text: w })
      }
    }
    if (li < arr.length - 1) toks.push({ type: T.PLAIN, text: '\n' })
    return toks
  })
}

function tokenize(code, lang) {
  if (lang === 'html') return tokenizeHtml(code)
  if (lang === 'sh')   return tokenizeSh(code)
  return tokenizeJs(code)
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {
      // fallback for environments without clipboard API
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <button
      className={`cb-copy${copied ? ' cb-copy--done' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      title={copied ? 'Copied' : 'Copy'}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CodeBlock({ children = '', lang = 'js', label }) {
  const code   = String(children)
  const tokens = tokenize(code, lang)

  return (
    <div className="cb">
      <div className="cb-bar">
        {label
          ? <span className="cb-label">{label}</span>
          : <span className="cb-label cb-label--lang">{lang}</span>
        }
        <CopyButton text={code} />
      </div>
      <pre className="cb-pre">
        <code className="cb-code">
          {tokens.map((tok, i) =>
            tok.type === T.PLAIN
              ? tok.text
              : <span key={i} className={tok.type}>{tok.text}</span>
          )}
        </code>
      </pre>
    </div>
  )
}
