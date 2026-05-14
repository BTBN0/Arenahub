import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#080c14',
        bg2:     '#0d1220',
        bg3:     '#121829',
        bg4:     '#1a2035',
        green:   '#00ff41',
        cyan:    '#00e5ff',
        yellow:  '#ffd700',
        red:     '#ff2d55',
        purple:  '#bf5af2',
        dim:     '#3a4560',
        dim2:    '#5a6a8a',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono2: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'blink':    'blink 1s step-end infinite',
        'bgShift':  'bgShift 25s linear infinite',
        'pulse-px': 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink:   { '50%': { opacity: '0' } },
        bgShift: {
          '0%':   { backgroundPosition: '0 0, 16px 16px' },
          '100%': { backgroundPosition: '32px 32px, 48px 48px' },
        },
      },
    },
  },
  plugins: [],
}
export default config
