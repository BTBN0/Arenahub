import LandingClient from '@/components/landing/LandingClient'

// Fetch leaderboard server-side so the hero panel is pre-populated
async function getLeaderboard() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/leaderboard?limit=6`, {
      next: { revalidate: 60 }, // ISR: refresh every 60s
    })
    const d = await res.json()
    if (d.ok && d.users?.length) return d.users as { username: string; xp: number }[]
  } catch {}
  return [
    { username: 'DARKCODE_X',    xp: 12450 },
    { username: 'PIXEL_NINJA',   xp: 11200 },
    { username: 'BYTE_QUEEN',    xp: 10800 },
    { username: 'CODECATCH',     xp:  9600 },
    { username: 'GLITCH_RIDER',  xp:  8900 },
    { username: 'HEXHUNTER',     xp:  8200 },
  ]
}

export default async function HomePage() {
  const lb = await getLeaderboard()
  return <LandingClient initialLb={lb} />
}