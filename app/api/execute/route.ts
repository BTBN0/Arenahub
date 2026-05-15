import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import { rateLimiter, getClientIP } from '@/lib/services/security.service'
import vm from 'vm'

interface TestCase { input: unknown; expected: unknown; label?: string; type?: string }
interface RunResult { label:string; input:unknown; expected:unknown; actual:unknown; passed:boolean; error?:string; runtime?:number; logs?: string[] }

// Expanded block list — prevents sandbox escape attempts
const BLOCKED = [
  'require(', 'import(', 'process.', 'process[',
  'fs.', 'child_process', 'child_process',
  '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__',
  'prototype.constructor', 'constructor.constructor',
  'globalThis', 'global.', 'global[',
  'Buffer(', 'Buffer.', 'XMLHttpRequest', 'fetch(',
  'eval(', 'Function(', 'setTimeout(', 'setInterval(',
  'Reflect.', 'Proxy(', 'Atomics.',
  'WebAssembly', 'SharedArrayBuffer',
  'document.', 'window.', 'location.',
  'this.constructor', '[].constructor',
]

function scanCode(code: string): string | null {
  const lower = code.toLowerCase()
  for (const b of BLOCKED) if (lower.includes(b.toLowerCase())) return `Хориглогдсон: "${b}"`
  if (code.length > 8000) return 'Код хэт урт (8000 тэмдэгт хүртэл)'
  // Block potential prototype pollution patterns
  if (/\[['"]constructor['"]\]/.test(code)) return 'Хориглогдсон: constructor access'
  if (/Object\.assign\s*\(/.test(code) && /proto/.test(code)) return 'Хориглогдсон: prototype pollution'
  return null
}

// ─── Detect code type ───
function detectType(code: string): 'html'|'css'|'sql'|'js' {
  const s = code.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'').trim()
  if (s.startsWith('<') || s.startsWith('<!')) return 'html'
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\b/i.test(s)) return 'sql'
  if (code.includes('-- SQL') || /^\s*--/.test(s)) return 'sql'
  if (code.includes('<!-- HTML')) return 'html'
  if (code.includes('/* CSS')) return 'css'
  // CSS: has { } but no function/arrow/if/return
  if (s.includes('{') && s.includes('}') && !/(function|=>|if\s*\(|return\s)/.test(s)) return 'css'
  return 'js'
}

// ─── Deep equal with tolerance ───
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (b === null || b === undefined) return a === b
  if (a === null || a === undefined) return false
  // Number tolerance
  if (typeof a === 'number' && typeof b === 'number') {
    if (isNaN(a) && isNaN(b)) return true
    return Math.abs(a - b) < 0.0001
  }
  // Coerce string↔number
  if (typeof a === 'number' && typeof b === 'string') return Math.abs(a - Number(b)) < 0.0001
  if (typeof a === 'string' && typeof b === 'number') return Math.abs(Number(a) - b) < 0.0001
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]))
  }
  // Objects — only check expected's keys (ignore extra keys in actual)
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const bo = b as Record<string,unknown>
    const ao = a as Record<string,unknown>
    return Object.keys(bo).every(k => deepEqual(ao[k], bo[k]))
  }
  return String(a) === String(b)
}

// ─── HTML checker ───
function normalizeHTML(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s*=\s*/g, '=')
    .replace(/"\s+/g, '"')
    .trim()
}
function checkHTML(code: string, expected: string) {
  const actual = normalizeHTML(code)
  const exp = normalizeHTML(expected)
  return { result: actual, passed: actual === exp }
}

// ─── CSS checker ───
function normalizeCSS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\{\s*/g, ' { ')
    .replace(/\s*\}\s*/g, ' } ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .replace(/;\s*\}/g, ' }')
    .replace(/\s*,\s*/g, ', ')
    .trim()
}
function checkCSS(code: string, expected: string) {
  const actual = normalizeCSS(code)
  const exp = normalizeCSS(expected)
  return { result: actual, passed: actual === exp }
}

// ─── SQL INSERT parser ───
function parseInsert(sql: string): { rows: Record<string,unknown>[] } {
  const m = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i)
  if (!m) return { rows: [] }
  const cols = m[1].split(',').map(c => c.trim())
  const rows: Record<string,unknown>[] = []
  const re = /\(([^)]+)\)/g
  let match
  while ((match = re.exec(m[2])) !== null) {
    const vals = match[1].split(',').map(v => {
      const t = v.trim()
      if (/^['"]/.test(t)) return t.slice(1, -1)
      const n = Number(t)
      return isNaN(n) ? t : n
    })
    const row: Record<string,unknown> = {}
    cols.forEach((c, i) => { row[c] = vals[i] })
    rows.push(row)
  }
  return { rows }
}

// ─── SQL runner ───
function evalWhere(row: Record<string,unknown>, cond: string): boolean {
  if (/\bAND\b/i.test(cond)) return cond.split(/\bAND\b/i).every(c => evalWhere(row, c.trim()))
  if (/\bOR\b/i.test(cond)) return cond.split(/\bOR\b/i).some(c => evalWhere(row, c.trim()))
  const like = cond.match(/(\w+)\s+LIKE\s+'([^']+)'/i)
  if (like) {
    const v = String(row[like[1]] ?? row[like[1].toLowerCase()] ?? '')
    const p = '^' + like[2].replace(/%/g, '.*').replace(/_/g, '.') + '$'
    return new RegExp(p, 'i').test(v)
  }
  for (const op of [' >= ', ' <= ', ' != ', ' <> ', ' > ', ' < ', ' = ']) {
    if (!cond.includes(op)) continue
    const [col, val] = cond.split(op).map(s => s.trim())
    const rv = row[col] ?? row[col.toLowerCase()]
    const v = val.replace(/^['"]|['"]$/g, '')
    const num = parseFloat(v), rn = Number(rv)
    const t = op.trim()
    if (t === '=')  return String(rv) === v || (!isNaN(num) && !isNaN(rn) && rn === num)
    if (t === '!=' || t === '<>') return String(rv) !== v
    if (t === '>')  return rn > num
    if (t === '<')  return rn < num
    if (t === '>=') return rn >= num
    if (t === '<=') return rn <= num
  }
  return true
}

function runSQL(code: string, tables: Record<string, Record<string,unknown>[]>): { rows: unknown[]; error?: string } {
  try {
    const sql = code.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim()
    const tbl = (name: string) => tables[name.toLowerCase()] || tables[name] || []

    // COUNT(*)
    const cntM = sql.match(/SELECT\s+COUNT\(\*\)(?:\s+AS\s+\w+)?\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s*;?\s*)$/i)
    if (cntM) {
      let rows = [...tbl(cntM[1])]
      if (cntM[2]) rows = rows.filter(r => evalWhere(r as Record<string,unknown>, cntM[2].trim()))
      return { rows: [{ count: rows.length }] }
    }

    // SELECT *|cols FROM tbl [WHERE] [ORDER BY] [LIMIT]
    const selM = sql.match(/SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+([\s\S]+?))?(?:\s+LIMIT\s+(\d+))?(?:\s*;?\s*)$/i)
    if (selM) {
      const [, cols, name, where, orderBy, limit] = selM
      let rows = [...tbl(name)]
      if (where) rows = rows.filter(r => evalWhere(r as Record<string,unknown>, where.trim()))
      if (orderBy) {
        const [col, dir] = orderBy.trim().split(/\s+/)
        const desc = dir?.toUpperCase() === 'DESC'
        rows.sort((a: any, b: any) => {
          const av = a[col] ?? a[col.toLowerCase()]
          const bv = b[col] ?? b[col.toLowerCase()]
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
          return desc ? -cmp : cmp
        })
      }
      if (limit) rows = rows.slice(0, parseInt(limit))
      if (cols.trim() === '*') return { rows }
      const colList = cols.split(',').map(c => c.trim())
      return {
        rows: rows.map(r => {
          const out: Record<string,unknown> = {}
          colList.forEach(c => { out[c] = (r as any)[c] ?? (r as any)[c.toLowerCase()] })
          return out
        })
      }
    }
    return { rows: [], error: 'SQL дэмжигдэхгүй байна' }
  } catch (e) {
    return { rows: [], error: String(e) }
  }
}

// ─── JS Sandbox ───
// Finds any function defined in code: function foo(), const foo = () => {}, const foo = function() {}
function findFnName(code: string): string {
  const m = code.match(/(?:^|\n)\s*(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|\w+\s*=>))/m)
  return m?.[1] || m?.[2] || 'solution'
}

async function runJS(code: string, input: unknown): Promise<{ result: unknown; error?: string; runtime: number; logs: string[] }> {
  const start = Date.now()
  const logs: string[] = []
  const sandbox = {
    console: {
      log: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      error: (...a: unknown[]) => logs.push('[err] ' + a.map(String).join(' ')),
      warn: (...a: unknown[]) => logs.push('[warn] ' + a.map(String).join(' ')),
    },
    input,
    result: undefined as unknown,
    JSON, Math, parseInt, parseFloat, Number, String, Array, Object,
    Boolean, isNaN, isFinite, Map, Set, Date, RegExp,
  }

  const fn = findFnName(code)
  const wrapped = `(async () => {
${code}
const _candidates = [
  typeof ${fn} !== 'undefined' ? ${fn} : undefined,
  typeof solution !== 'undefined' ? solution : undefined,
].filter(Boolean)
const _fn = _candidates[0]
if (typeof _fn === 'function') {
  result = await Promise.resolve(
    Array.isArray(input) ? _fn(...input) : input === null ? _fn() : _fn(input)
  )
}
})()`

  try {
    const ctx = vm.createContext(sandbox)
    const p = new vm.Script(wrapped).runInContext(ctx, { timeout: 2500 })
    // Fix: async Promise has no timeout — wrap with race to enforce limit
    if (p && typeof (p as any).then === 'function') {
      await Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error('Хугацаа дууслаа (3s)')), 3000)),
      ])
    }
    return { result: sandbox.result, runtime: Date.now() - start, logs }
  } catch (e: unknown) {
    return { result: undefined, error: (e as Error).message, runtime: Date.now() - start, logs }
  }
}

// ─── Run one test ───
async function runTest(code: string, tc: TestCase, idx: number): Promise<RunResult> {
  const label = tc.label || `Test ${idx + 1}`
  const start = Date.now()
  const blocked = scanCode(code)
  if (blocked) return { label, input: tc.input, expected: tc.expected, actual: undefined, passed: false, error: `🔒 ${blocked}` }

  const type = tc.type || detectType(code)

  if (type === 'html') {
    const { result, passed } = checkHTML(code, String(tc.expected))
    return { label, input: tc.input, expected: tc.expected, actual: result, passed, runtime: Date.now() - start }
  }
  if (type === 'css') {
    const { result, passed } = checkCSS(code, String(tc.expected))
    return { label, input: tc.input, expected: tc.expected, actual: result, passed, runtime: Date.now() - start }
  }
  if (type === 'sql_ddl') {
    const norm = (s: string) => s
      .replace(/\s+/g, ' ')
      .replace(/;\s*/g, '; ')
      .replace(/;\s*$/, '')
      .trim()
    const actual = norm(code), expected = norm(String(tc.expected))
    return { label, input: tc.input, expected: tc.expected, actual, passed: actual === expected, runtime: Date.now() - start }
  }
  if (type === 'sql_insert') {
    const { rows } = parseInsert(code)
    return { label, input: tc.input, expected: tc.expected, actual: rows, passed: deepEqual(rows, tc.expected), runtime: Date.now() - start }
  }
  if (type === 'sql') {
    const tables = (tc.input as any)?.tables || {}
    const { rows, error } = runSQL(code, tables)
    if (error) return { label, input: tc.input, expected: tc.expected, actual: undefined, passed: false, error: `SQL: ${error}`, runtime: Date.now() - start }
    return { label, input: tc.input, expected: tc.expected, actual: rows, passed: deepEqual(rows, tc.expected), runtime: Date.now() - start }
  }

  // JS
  const { result, error, runtime, logs } = await runJS(code, tc.input)
  if (error) {
    // Friendly error messages
    const friendly = error
      .replace('ReferenceError: ', '')
      .replace('TypeError: ', '')
      .replace('SyntaxError: ', '')
      .slice(0, 100)
    return { label, input: tc.input, expected: tc.expected, actual: undefined, passed: false, error: `💥 ${friendly}`, runtime }
  }
  const passed = deepEqual(result, tc.expected)
  const res: RunResult = { label, input: tc.input, expected: tc.expected, actual: result, passed, runtime }
  if (logs.length > 0) (res as any).logs = logs
  return res
}

export async function POST(req: NextRequest) {
  try {
    const u  = requireAuth(req)
    const ip = getClientIP(req)

    // Rate limit: 20 executions per user per minute
    if (!rateLimiter(`exec:${u.id}`, 20, 60_000))
      return err('Хэт олон код ажиллуулав. 1 минут хүлээнэ үү.', 429)
    // Also rate limit by IP
    if (!rateLimiter(`exec_ip:${ip}`, 40, 60_000))
      return err('Хэт олон хүсэлт.', 429)

    const { code, testCases } = await req.json() as { code: string; testCases: TestCase[] }
    if (!code?.trim()) return err('Код оруулна уу')
    if (!Array.isArray(testCases) || testCases.length === 0) return err('Test case байхгүй')
    if (testCases.length > 20) return err('Test case хэт олон (20 хүртэл)')
    const blocked = scanCode(code)
    if (blocked) return err(blocked)
    const results: RunResult[] = []
    for (const [i, tc] of testCases.entries()) results.push(await runTest(code, tc, i))
    const passCount = results.filter(r => r.passed).length
    return ok({
      results, allPass: passCount === results.length,
      passCount, total: results.length,
      avgRuntime: Math.round(results.reduce((s, r) => s + (r.runtime || 0), 0) / results.length),
      summary: `${passCount}/${results.length} passed`
    })
  } catch (e) { return handleError(e) }
}
