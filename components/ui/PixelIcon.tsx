import { type ReactElement } from 'react'

type IconName =
  | 'dashboard' | 'lessons' | 'leaderboard' | 'achievements' | 'rewards'
  | 'notifications' | 'pricing' | 'ai' | 'profile'
  | 'crown' | 'coin' | 'sword' | 'trophy' | 'gift' | 'star' | 'robot' | 'bell' | 'lock' | 'list'

interface Props { name: IconName; size?: number; col?: string }

const DEFS: Record<IconName, (c: string) => ReactElement> = {
  dashboard: c => (
    <svg viewBox="0 0 8 8" style={{ imageRendering:'pixelated' }}>
      <rect x="0" y="0" width="3" height="3" fill={c}/>
      <rect x="5" y="0" width="3" height="3" fill={c} opacity=".75"/>
      <rect x="0" y="5" width="3" height="3" fill={c} opacity=".75"/>
      <rect x="5" y="5" width="3" height="3" fill={c}/>
    </svg>
  ),
  lessons: c => (
    <svg viewBox="0 0 8 8" style={{ imageRendering:'pixelated' }}>
      <rect x="1" y="0" width="6" height="1" fill={c}/>
      <rect x="0" y="1" width="1" height="6" fill={c}/>
      <rect x="7" y="1" width="1" height="6" fill={c}/>
      <rect x="1" y="7" width="6" height="1" fill={c}/>
      <rect x="2" y="2" width="4" height="1" fill={c} opacity=".9"/>
      <rect x="2" y="4" width="3" height="1" fill={c} opacity=".65"/>
      <rect x="2" y="6" width="2" height="1" fill={c} opacity=".4"/>
    </svg>
  ),
  leaderboard: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="0" y="8" width="10" height="2" fill={c}/>
      <rect x="0" y="5" width="3" height="3" fill={c}/>
      <rect x="3" y="6" width="3" height="2" fill={c} opacity=".75"/>
      <rect x="6" y="2" width="3" height="6" fill={c} opacity=".9"/>
      <rect x="6" y="1" width="3" height="1" fill={c} opacity=".45"/>
    </svg>
  ),
  achievements: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="2" y="0" width="6" height="1" fill={c}/>
      <rect x="1" y="1" width="1" height="4" fill={c}/>
      <rect x="8" y="1" width="1" height="4" fill={c}/>
      <rect x="2" y="5" width="2" height="1" fill={c}/>
      <rect x="6" y="5" width="2" height="1" fill={c}/>
      <rect x="3" y="6" width="4" height="1" fill={c} opacity=".8"/>
      <rect x="4" y="7" width="2" height="1" fill={c}/>
      <rect x="3" y="8" width="4" height="2" fill={c} opacity=".9"/>
    </svg>
  ),
  rewards: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="2" y="0" width="6" height="3" fill={c}/>
      <rect x="3" y="1" width="4" height="1" fill={c} opacity=".45"/>
      <rect x="0" y="3" width="10" height="2" fill={c} opacity=".85"/>
      <rect x="2" y="5" width="6" height="5" fill={c} opacity=".9"/>
      <rect x="4" y="5" width="2" height="5" fill={c} opacity=".55"/>
    </svg>
  ),
  notifications: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="4" y="0" width="2" height="1" fill={c}/>
      <rect x="3" y="1" width="4" height="1" fill={c}/>
      <rect x="1" y="2" width="8" height="5" fill={c} opacity=".9"/>
      <rect x="0" y="6" width="10" height="1" fill={c}/>
      <rect x="4" y="7" width="2" height="3" fill={c} opacity=".8"/>
    </svg>
  ),
  pricing: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="1" y="0" width="8" height="8" fill={c}/>
      <rect x="2" y="1" width="6" height="6" fill="#020609"/>
      <rect x="3" y="2" width="4" height="1" fill={c}/>
      <rect x="3" y="4" width="2" height="1" fill={c}/>
      <rect x="3" y="6" width="4" height="1" fill={c}/>
      <rect x="4" y="8" width="2" height="2" fill={c}/>
      <rect x="3" y="9" width="4" height="1" fill={c}/>
    </svg>
  ),
  ai: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="1" y="1" width="8" height="7" fill={c}/>
      <rect x="2" y="2" width="2" height="2" fill="#020609"/>
      <rect x="6" y="2" width="2" height="2" fill="#020609"/>
      <rect x="2" y="5" width="6" height="1" fill="#020609"/>
      <rect x="4" y="0" width="2" height="1" fill={c}/>
      <rect x="0" y="8" width="4" height="2" fill={c}/>
      <rect x="6" y="8" width="4" height="2" fill={c}/>
    </svg>
  ),
  profile: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="3" y="0" width="4" height="4" fill={c}/>
      <rect x="2" y="1" width="1" height="2" fill={c} opacity=".55"/>
      <rect x="7" y="1" width="1" height="2" fill={c} opacity=".55"/>
      <rect x="4" y="4" width="2" height="3" fill={c} opacity=".8"/>
      <rect x="0" y="6" width="10" height="4" fill={c} opacity=".9"/>
    </svg>
  ),
  crown: c => (
    <svg viewBox="0 0 10 8" style={{ imageRendering:'pixelated' }}>
      <rect x="0" y="2" width="1" height="3" fill={c}/>
      <rect x="9" y="2" width="1" height="3" fill={c}/>
      <rect x="2" y="0" width="1" height="4" fill={c}/>
      <rect x="7" y="0" width="1" height="4" fill={c}/>
      <rect x="4" y="1" width="2" height="3" fill={c}/>
      <rect x="0" y="5" width="10" height="3" fill={c}/>
      <rect x="1" y="5" width="8" height="1" fill={c} opacity=".6"/>
    </svg>
  ),
  coin: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="3" y="0" width="4" height="1" fill={c}/>
      <rect x="1" y="1" width="2" height="1" fill={c}/>
      <rect x="7" y="1" width="2" height="1" fill={c}/>
      <rect x="0" y="2" width="1" height="6" fill={c}/>
      <rect x="9" y="2" width="1" height="6" fill={c}/>
      <rect x="1" y="8" width="2" height="1" fill={c}/>
      <rect x="7" y="8" width="2" height="1" fill={c}/>
      <rect x="3" y="9" width="4" height="1" fill={c}/>
      <rect x="4" y="3" width="2" height="1" fill={c}/>
      <rect x="3" y="4" width="4" height="1" fill={c}/>
      <rect x="3" y="6" width="4" height="1" fill={c}/>
      <rect x="4" y="7" width="2" height="1" fill={c}/>
    </svg>
  ),
  sword: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="4" y="0" width="2" height="6" fill={c}/>
      <rect x="3" y="1" width="1" height="1" fill={c} opacity=".6"/>
      <rect x="6" y="1" width="1" height="1" fill={c} opacity=".6"/>
      <rect x="2" y="6" width="6" height="1" fill={c}/>
      <rect x="1" y="7" width="8" height="1" fill={c} opacity=".7"/>
      <rect x="4" y="8" width="2" height="2" fill={c} opacity=".85"/>
    </svg>
  ),
  trophy: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="2" y="0" width="6" height="5" fill={c}/>
      <rect x="1" y="1" width="1" height="2" fill={c}/>
      <rect x="8" y="1" width="1" height="2" fill={c}/>
      <rect x="3" y="5" width="4" height="1" fill={c} opacity=".8"/>
      <rect x="4" y="6" width="2" height="2" fill={c}/>
      <rect x="2" y="8" width="6" height="2" fill={c} opacity=".9"/>
    </svg>
  ),
  gift: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="1" y="3" width="8" height="2" fill={c}/>
      <rect x="2" y="5" width="6" height="5" fill={c} opacity=".9"/>
      <rect x="4" y="3" width="2" height="7" fill={c} opacity=".6"/>
      <rect x="3" y="0" width="4" height="3" fill={c} opacity=".75"/>
      <rect x="4" y="1" width="2" height="2" fill={c} opacity=".5"/>
    </svg>
  ),
  star: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="4" y="0" width="2" height="3" fill={c}/>
      <rect x="0" y="3" width="10" height="2" fill={c}/>
      <rect x="2" y="5" width="6" height="2" fill={c} opacity=".85"/>
      <rect x="1" y="7" width="3" height="3" fill={c} opacity=".8"/>
      <rect x="6" y="7" width="3" height="3" fill={c} opacity=".8"/>
    </svg>
  ),
  robot: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="1" y="1" width="8" height="7" fill={c}/>
      <rect x="2" y="2" width="2" height="2" fill="#020609"/>
      <rect x="6" y="2" width="2" height="2" fill="#020609"/>
      <rect x="2" y="5" width="6" height="1" fill="#020609"/>
      <rect x="4" y="0" width="2" height="1" fill={c}/>
      <rect x="0" y="8" width="4" height="2" fill={c}/>
      <rect x="6" y="8" width="4" height="2" fill={c}/>
    </svg>
  ),
  bell: c => (
    <svg viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
      <rect x="4" y="0" width="2" height="1" fill={c}/>
      <rect x="3" y="1" width="4" height="1" fill={c}/>
      <rect x="1" y="2" width="8" height="5" fill={c} opacity=".9"/>
      <rect x="0" y="6" width="10" height="1" fill={c}/>
      <rect x="4" y="7" width="2" height="3" fill={c} opacity=".8"/>
    </svg>
  ),
  lock: c => (
    <svg viewBox="0 0 8 10" style={{ imageRendering:'pixelated' }}>
      <rect x="3" y="0" width="2" height="1" fill={c}/>
      <rect x="2" y="1" width="1" height="3" fill={c}/>
      <rect x="5" y="1" width="1" height="3" fill={c}/>
      <rect x="0" y="3" width="8" height="7" fill={c} opacity=".9"/>
      <rect x="1" y="4" width="6" height="5" fill={c} opacity=".15"/>
      <rect x="3" y="5" width="2" height="2" fill={c}/>
      <rect x="3" y="7" width="2" height="1" fill={c} opacity=".6"/>
    </svg>
  ),
  list: c => (
    <svg viewBox="0 0 8 8" style={{ imageRendering:'pixelated' }}>
      <rect x="0" y="1" width="2" height="2" fill={c}/>
      <rect x="3" y="1" width="5" height="1" fill={c} opacity=".9"/>
      <rect x="3" y="2" width="4" height="1" fill={c} opacity=".55"/>
      <rect x="0" y="5" width="2" height="2" fill={c}/>
      <rect x="3" y="5" width="5" height="1" fill={c} opacity=".9"/>
      <rect x="3" y="6" width="4" height="1" fill={c} opacity=".55"/>
    </svg>
  ),
}

export default function PixelIcon({ name, size = 20, col = '#ffffff' }: Props) {
  return (
    <span style={{ display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      {DEFS[name](col)}
    </span>
  )
}