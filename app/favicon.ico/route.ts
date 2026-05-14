import { NextResponse } from 'next/server'

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#080c16"/>
  <rect x="6"  y="6"  width="4" height="4" fill="#00e5ff"/>
  <rect x="10" y="6"  width="4" height="4" fill="#00e5ff"/>
  <rect x="14" y="6"  width="4" height="4" fill="#00e5ff"/>
  <rect x="18" y="6"  width="4" height="4" fill="#00e5ff"/>
  <rect x="6"  y="10" width="4" height="4" fill="#00e5ff"/>
  <rect x="6"  y="14" width="4" height="4" fill="#00e5ff"/>
  <rect x="10" y="14" width="4" height="4" fill="#00e5ff"/>
  <rect x="14" y="14" width="4" height="4" fill="#00e5ff"/>
  <rect x="6"  y="18" width="4" height="4" fill="#00e5ff"/>
  <rect x="6"  y="22" width="4" height="4" fill="#00e5ff"/>
  <rect x="10" y="22" width="4" height="4" fill="#00e5ff"/>
  <rect x="14" y="22" width="4" height="4" fill="#00e5ff"/>
  <rect x="18" y="22" width="4" height="4" fill="#00e5ff"/>
</svg>`

export function GET() {
  return new NextResponse(SVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}