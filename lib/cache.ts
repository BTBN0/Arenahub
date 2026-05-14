type CacheEntry<T> = { data: T; expiresAt: number }

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { store.delete(key); return null }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function cacheDel(key: string): void {
  store.delete(key)
}

export function cacheClear(prefix: string): void {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k)
  }
}

// Purge expired entries every 60s to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) if (now > v.expiresAt) store.delete(k)
}, 60_000)