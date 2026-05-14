'use client'
import { useEffect, useRef } from 'react'

type ModelType = 'computer' | 'trophy' | 'rocket' | 'database' | 'shield' | 'code'

interface Props {
  type: ModelType
  size?: number
}

export default function PixelModel3D({ type, size = 140 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DPR = window.devicePixelRatio || 1
    canvas.width  = size * DPR
    canvas.height = size * DPR
    canvas.style.width  = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(DPR, DPR)

    const W = size, H = size
    let angle = 0
    let t = 0

    // Project 3D → 2D isometric
    const proj = (x: number, y: number, z: number, rot: number) => {
      const cos = Math.cos(rot), sin = Math.sin(rot)
      const rx = x * cos - z * sin
      const rz = x * sin + z * cos
      return {
        sx: W / 2 + (rx - rz) * 0.75,
        sy: H / 2 + (rx + rz) * 0.38 - y * 1.1
      }
    }

    // Draw one voxel cube
    const vox = (
      x: number, y: number, z: number,
      rot: number,
      top: string, left: string, right: string,
      s = 8
    ) => {
      const p = (px: number, py: number, pz: number) => proj(px, py, pz, rot)

      const ftl = p(x,   y,   z)
      const ftr = p(x+s, y,   z)
      const fbl = p(x,   y,   z+s)
      const fbr = p(x+s, y,   z+s)
      const btl = p(x,   y+s, z)
      const btr = p(x+s, y+s, z)
      const bbl = p(x,   y+s, z+s)
      const bbr = p(x+s, y+s, z+s)

      // Top
      ctx.beginPath()
      ctx.moveTo(ftl.sx,ftl.sy); ctx.lineTo(ftr.sx,ftr.sy)
      ctx.lineTo(fbr.sx,fbr.sy); ctx.lineTo(fbl.sx,fbl.sy)
      ctx.closePath(); ctx.fillStyle = top; ctx.fill()

      // Left
      ctx.beginPath()
      ctx.moveTo(ftl.sx,ftl.sy); ctx.lineTo(fbl.sx,fbl.sy)
      ctx.lineTo(bbl.sx,bbl.sy); ctx.lineTo(btl.sx,btl.sy)
      ctx.closePath(); ctx.fillStyle = left; ctx.fill()

      // Right
      ctx.beginPath()
      ctx.moveTo(ftr.sx,ftr.sy); ctx.lineTo(fbr.sx,fbr.sy)
      ctx.lineTo(bbr.sx,bbr.sy); ctx.lineTo(btr.sx,btr.sy)
      ctx.closePath(); ctx.fillStyle = right; ctx.fill()

      // Edge highlights
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(ftl.sx,ftl.sy); ctx.lineTo(ftr.sx,ftr.sy)
      ctx.lineTo(fbr.sx,fbr.sy); ctx.lineTo(fbl.sx,fbl.sy)
      ctx.closePath(); ctx.stroke()
    }

    // Lighten/darken helper
    const shade = (hex: string, pct: number) => {
      const n = parseInt(hex.slice(1), 16)
      const r = Math.min(255, Math.max(0, (n >> 16) + pct))
      const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct))
      const b = Math.min(255, Math.max(0, (n & 0xff) + pct))
      return `rgb(${r},${g},${b})`
    }

    const mkFace = (base: string) => ({
      t: shade(base, 40),
      l: shade(base, -20),
      r: shade(base, -50),
    })

    // ── MODELS ──
    const models: Record<ModelType, () => void> = {

      // 🚀 ROCKET
      rocket: () => {
        const bob = Math.sin(t * 0.04) * 3
        // Flame (animated)
        const fl = mkFace('#ff6600')
        const fl2 = mkFace('#ffaa00')
        vox(-3, 16+bob, -3, angle, fl2.t, fl2.l, fl2.r, 6)
        vox(-2, 20+bob+Math.sin(t*0.1)*2, -2, angle, fl.t, fl.l, fl.r, 4)
        // Body
        const body = mkFace('#e8eaf6')
        const body2 = mkFace('#c5cae9')
        vox(-4, -4+bob, -4, angle, body.t, body.l, body.r, 8)
        vox(-5, 2+bob,  -5, angle, body2.t, body2.l, body2.r, 10)
        vox(-5, 8+bob,  -5, angle, body2.t, body2.l, body2.r, 10)
        // Nose cone
        const nose = mkFace('#ef5350')
        vox(-3, -10+bob, -3, angle, nose.t, nose.l, nose.r, 6)
        vox(-2, -16+bob, -2, angle, nose.t, nose.l, nose.r, 4)
        vox(-1, -20+bob, -1, angle, nose.t, nose.l, nose.r, 2)
        // Window
        const win = mkFace('#29b6f6')
        vox(-2, -1+bob, -2, angle, win.t, win.l, win.r, 4)
        // Fins
        const fin = mkFace('#ef5350')
        vox(-8, 10+bob, -3, angle, fin.t, fin.l, fin.r, 4)
        vox(4,  10+bob, -3, angle, fin.t, fin.l, fin.r, 4)
        vox(-3, 10+bob, -8, angle, fin.t, fin.l, fin.r, 4)
        vox(-3, 10+bob,  4, angle, fin.t, fin.l, fin.r, 4)
      },

      // 🏆 TROPHY
      trophy: () => {
        const bob = Math.sin(t * 0.03) * 2
        const gold = mkFace('#ffd700')
        const dgold = mkFace('#f9a825')
        // Base plate
        vox(-10, 14+bob, -6, angle, dgold.t, dgold.l, dgold.r, 20)
        // Stem
        vox(-3, 6+bob, -3, angle, gold.t, gold.l, gold.r, 6)
        // Cup body
        vox(-10, -6+bob, -10, angle, gold.t, gold.l, gold.r, 20)
        vox(-12, -14+bob, -12, angle, gold.t, gold.l, gold.r, 24)
        vox(-10, -20+bob, -10, angle, dgold.t, dgold.l, dgold.r, 20)
        // Handles
        const h = mkFace('#ffb300')
        vox(-16, -10+bob, -6, angle, h.t, h.l, h.r, 4)
        vox(-16, -6+bob,  -6, angle, h.t, h.l, h.r, 4)
        vox( 12, -10+bob, -6, angle, h.t, h.l, h.r, 4)
        vox( 12, -6+bob,  -6, angle, h.t, h.l, h.r, 4)
        // Star on cup
        const star = mkFace('#fff176')
        vox(-2, -14+bob, -2, angle, star.t, star.l, star.r, 4)
        // Glow particles (animated)
        if (Math.sin(t * 0.1) > 0.5) {
          const glow = mkFace('#fffde7')
          vox(-14, -22+bob, -2, angle, glow.t, glow.l, glow.r, 2)
          vox( 10, -24+bob, -4, angle, glow.t, glow.l, glow.r, 2)
          vox(-2,  -26+bob, 10, angle, glow.t, glow.l, glow.r, 2)
        }
      },

      // 🖥 COMPUTER
      computer: () => {
        const bob = Math.sin(t * 0.025) * 1.5
        // Base/desk
        const desk = mkFace('#37474f')
        vox(-16, 18+bob, -10, angle, desk.t, desk.l, desk.r, 32)
        // Stand
        const stand = mkFace('#455a64')
        vox(-4, 8+bob, -4, angle, stand.t, stand.l, stand.r, 8)
        // Monitor back
        const mback = mkFace('#263238')
        vox(-14, -18+bob, -2, angle, mback.t, mback.l, mback.r, 28)
        // Screen (animated color)
        const hue = (Math.sin(t*0.02)*30 + 200) | 0
        const screen = mkFace(`hsl(${hue},80%,25%)`)
        vox(-12, -16+bob, 0, angle, screen.t, screen.l, screen.r, 24)
        // Code lines on screen
        const line1 = mkFace('#00e676')
        const line2 = mkFace('#40c4ff')
        const line3 = mkFace('#ff6d00')
        vox(-10, -14+bob, 1, angle, line1.t, line1.l, line1.r, 14)
        vox(-10, -10+bob, 1, angle, line2.t, line2.l, line2.r, 18)
        vox(-10, -6+bob,  1, angle, line3.t, line3.l, line3.r, 10)
        vox(-10, -2+bob,  1, angle, line1.t, line1.l, line1.r, 16)
        // Cursor blink
        if ((t >> 3) % 2 === 0) {
          const cur = mkFace('#ffffff')
          vox(2, -2+bob, 1, angle, cur.t, cur.l, cur.r, 2)
        }
        // Keyboard
        const kbd = mkFace('#546e7a')
        vox(-12, 10+bob, 4, angle, kbd.t, kbd.l, kbd.r, 24)
        // Keys
        for (let i = 0; i < 5; i++) {
          const key = mkFace('#607d8b')
          vox(-10+i*4, 8+bob, 6, angle, key.t, key.l, key.r, 2)
        }
      },

      // 🗄 DATABASE
      database: () => {
        const bob = Math.sin(t * 0.03) * 2
        // Data flow particles
        const flow = mkFace('#00e5ff')
        const fy = ((t * 2) % 60) - 30
        vox(-2, fy+bob, -2, angle, flow.t, flow.l, flow.r, 4)
        vox(-2, fy+20+bob, -2, angle, flow.t, flow.l, flow.r, 3)

        // Stack of cylinders (approximated with flat boxes)
        const tiers = [
          { y: -20, col: '#1565c0', h: 6 },
          { y: -10, col: '#1976d2', h: 6 },
          { y:   0, col: '#1e88e5', h: 6 },
          { y:  10, col: '#1976d2', h: 6 },
        ]
        tiers.forEach(tier => {
          const c = mkFace(tier.col)
          // Ellipse-like top
          vox(-12, tier.y+bob,    -12, angle, c.t, c.l, c.r, 24)
          vox(-14, tier.y+2+bob,  -10, angle, c.t, c.l, c.r, 28)
          vox(-12, tier.y+tier.h+bob, -12, angle, mkFace('#42a5f5').t, c.l, c.r, 24)
        })
        // Highlight ring
        const ring = mkFace('#80d8ff')
        vox(-13, -20+bob, -13, angle, ring.t, ring.l, ring.r, 2)
        vox(  9, -20+bob, -13, angle, ring.t, ring.l, ring.r, 2)
        // Lock icon
        const lock = mkFace('#ffd700')
        vox(-3, -5+bob, -14, angle, lock.t, lock.l, lock.r, 6)
        vox(-2, -10+bob, -14, angle, lock.t, lock.l, lock.r, 4)
      },

      // 🛡 SHIELD
      shield: () => {
        const bob = Math.sin(t * 0.03) * 2
        const pulse = Math.abs(Math.sin(t * 0.05))

        // Shield body - layered for depth
        const outer = mkFace('#6a1b9a')
        const inner = mkFace('#8e24aa')
        const bright = mkFace('#ce93d8')

        // Outer edge
        vox(-14, -22+bob, -2, angle, outer.t, outer.l, outer.r, 28)
        vox(-12, 10+bob,  -2, angle, outer.t, outer.l, outer.r, 24)
        vox(-8,  20+bob,  -2, angle, outer.t, outer.l, outer.r, 16)
        vox(-4,  28+bob,  -2, angle, outer.t, outer.l, outer.r, 8)

        // Inner panel
        vox(-12, -20+bob, 0, angle, inner.t, inner.l, inner.r, 24)
        vox(-10, 8+bob,   0, angle, inner.t, inner.l, inner.r, 20)
        vox(-6,  18+bob,  0, angle, inner.t, inner.l, inner.r, 12)

        // Center emblem - star
        const star = mkFace(`hsl(${50+pulse*30},100%,${60+pulse*20}%)`)
        vox(-4, -8+bob, 2, angle, star.t, star.l, star.r, 8)
        vox(-6, -4+bob, 2, angle, star.t, star.l, star.r, 2)
        vox( 2, -4+bob, 2, angle, star.t, star.l, star.r, 2)
        vox(-2, -12+bob, 2, angle, star.t, star.l, star.r, 2)
        vox(-2, 0+bob,   2, angle, star.t, star.l, star.r, 2)

        // Glow edge (animated)
        const glow = mkFace(`rgba(${(pulse*200)|0},100,255,0.8)`)
        vox(-14, -22+bob, -3, angle, glow.t, glow.l, glow.r, 2)
        vox( 12, -22+bob, -3, angle, glow.t, glow.l, glow.r, 2)
      },

      // 💻 CODE
      code: () => {
        const bob = Math.sin(t * 0.025) * 1.5
        // Laptop base
        const base = mkFace('#212121')
        vox(-14, 10+bob, -10, angle, base.t, base.l, base.r, 28)
        // Trackpad
        const pad = mkFace('#424242')
        vox(-6, 8+bob, -4, angle, pad.t, pad.l, pad.r, 12)
        // Screen back
        const back = mkFace('#1a1a2e')
        vox(-14, -20+bob, -1, angle, back.t, back.l, back.r, 28)
        // Screen (animated)
        const hue2 = (t * 2) % 360
        const scr = mkFace('#0d1117')
        vox(-12, -18+bob, 1, angle, scr.t, scr.l, scr.r, 24)
        // Code lines
        const cols = ['#00e676','#40c4ff','#ff6d00','#ea80fc','#00e5ff']
        cols.forEach((col, i) => {
          const ln = mkFace(col)
          const w = [16, 12, 18, 10, 14][i]
          vox(-10, -15+bob+i*4, 2, angle, ln.t, ln.l, ln.r, w)
        })
        // Bracket decorations
        const br = mkFace('#ffd700')
        vox(-12, -16+bob, 2, angle, br.t, br.l, br.r, 2)
        vox(-12, 0+bob,   2, angle, br.t, br.l, br.r, 2)
        // Terminal cursor
        if ((t >> 4) % 2 === 0) {
          const cur = mkFace('#00e676')
          vox(6, 0+bob, 2, angle, cur.t, cur.l, cur.r, 3)
        }
        // Keys
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 3; j++) {
            const key = mkFace(i===2&&j===1?'#263238':'#2d2d2d')
            vox(-12+i*4, 12+bob+j*0, 2+j*3, angle, key.t, key.l, key.r, 3)
          }
        }
      },
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Glow bg
      const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2)
      const glowColors: Record<ModelType, string> = {
        rocket:   'rgba(239,83,80,0.12)',
        trophy:   'rgba(255,215,0,0.12)',
        computer: 'rgba(0,229,255,0.10)',
        database: 'rgba(30,136,229,0.12)',
        shield:   'rgba(191,90,242,0.12)',
        code:     'rgba(0,230,118,0.10)',
      }
      g.addColorStop(0, glowColors[type])
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(W/2, H*0.85, W*0.28, H*0.05, 0, 0, Math.PI*2)
      ctx.fill()

      models[type]?.()

      angle += 0.018
      t++
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [type, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}
