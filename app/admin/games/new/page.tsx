'use client'
import GameForm, { type GameFormData } from '../_GameForm'

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''

export default function NewGamePage() {
  const handleSave = async (data: GameFormData) => {
    let config: Record<string, unknown> = {}
    try { config = data.config.trim() ? JSON.parse(data.config) : {} } catch { /* invalid — API will catch */ }

    const r = await fetch('/api/admin/games', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
      body: JSON.stringify({
        name:        data.name.trim(),
        slug:        data.slug.trim(),
        gameType:    data.gameType,
        description: data.description.trim() || undefined,
        thumbnail:   data.thumbnail.trim()   || undefined,
        hpMax:       Number(data.hpMax),
        xpReward:    Number(data.xpReward),
        isActive:    data.isActive,
        config,
      }),
    })

    if (r.ok) return { ok: true }
    const d = await r.json().catch(() => ({}))
    return { ok: false, error: d.error ?? 'Алдаа гарлаа' }
  }

  return <GameForm mode="create" onSave={handleSave} />
}
