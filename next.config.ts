import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Image optimization ──────────────────────────────
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'lh3.googleusercontent.com' },
      { protocol:'https', hostname:'avatars.githubusercontent.com' },
      { protocol:'https', hostname:'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h CDN cache for images
  },

  // ── Compiler optimizations ──────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Experimental ────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      '@monaco-editor/react',
      'lucide-react',
    ],
  },

  // ── Bundle size: exclude heavy server-only modules ──
  serverExternalPackages: ['bcryptjs', 'nodemailer'],

  // ── HTTP response headers ────────────────────────────
  async headers() {
    return [
      // Static assets — aggressive cache (production only; dev uses content-hashed filenames)
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }] : []),
      // Public fonts & images
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // Security headers on all routes
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
        ],
      },
      // API public endpoints — short CDN cache
      {
        source: '/api/courses',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/leaderboard',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=120' },
        ],
      },
      {
        source: '/api/contest',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────
  async redirects() {
    return []
  },
}

export default nextConfig