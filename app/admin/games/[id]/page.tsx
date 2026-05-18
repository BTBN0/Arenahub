'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GameForm, { type GameFormData } from '../_GameForm'
import { aGet } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''

type RawGame = {
  id: string; name: string; slug: string; gameType: string; description: string | null
  thumbnail: string | null; hpMax: number; xpReward: number; isActive: boolean; config: Record<string, unknown> | null
}

export default function EditGamePage() {
  const { id } = useParams<{ id: string }>()
  const [game,    setGame]    = useState<RawGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound,setNotFound]= useState(false)

  useEffect(() => {
    if (!id) return
    aGet(`/api/admin/games/${id}`).then(r => {
      if (!r.ok) { setNotFound(true); setLoading(false); return }
      return r.json()
    }).then(d => {
      if (d?.game) { setGame(d.game); setLoading(false) }
    })
  }, [id])

  const handleSave = async (data: GameFormData) => {
    let config: Record<string, unknown> = {}
    try { config = data.config.trim() ? JSON.parse(data.config) : {} } catch { /* API catches */ }

    const r = await fetch(`/api/admin/games/${id}`, {
      method: 'PUT',
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

  if (loading) {
    return (
      <div style={{ padding: 40, ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center' }}>
        УНШИЖ БАЙНА...
      </div>
    )
  }

  if (notFound || !game) {
    return (
      <div style={{ padding: 40, ...fp, fontSize: 9, color: 'var(--red)', textAlign: 'center' }}>
        ⚠ Тоглоом олдсонгүй (ID: {id})
      </div>
    )
  }

  const initial: GameFormData = {
    name:        game.name,
    slug:        game.slug,
    gameType:    game.gameType,
    description: game.description ?? '',
    thumbnail:   game.thumbnail   ?? '',
    hpMax:       String(game.hpMax),
    xpReward:    String(game.xpReward),
    isActive:    game.isActive,
    config:      game.config ? JSON.stringify(game.config, null, 2) : '{}',
  }

  return <GameForm mode="edit" gameId={id} initial={initial} onSave={handleSave} />
}
