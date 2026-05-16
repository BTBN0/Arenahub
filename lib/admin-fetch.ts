// Shared admin fetch helper
// Sends both Bearer token AND session cookie (credentials: 'include')
// so NextAuth cookie auth works even when Bearer token is expired

const tok = () =>
  typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''

export const adminHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization:  `Bearer ${tok()}`,
})

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include',                      // sends NextAuth session cookie
    headers: { ...adminHeaders(), ...((options.headers as Record<string, string>) ?? {}) },
  })
}

export const aGet  = (url: string)                    => adminFetch(url)
export const aPost = (url: string, body: unknown)     => adminFetch(url, { method: 'POST',   body: JSON.stringify(body) })
export const aPut  = (url: string, body: unknown)     => adminFetch(url, { method: 'PUT',    body: JSON.stringify(body) })
export const aPatch= (url: string, body: unknown)     => adminFetch(url, { method: 'PATCH',  body: JSON.stringify(body) })
export const aDel  = (url: string)                    => adminFetch(url, { method: 'DELETE' })