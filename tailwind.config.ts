import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}','./lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight:   '#050810',
        navy:       '#080D1A',
        'navy-light':'#0D1528',
        'navy-card':'#0F1A2E',
        electric:   '#00D4FF',
        plasma:     '#7B61FF',
        aurora:     '#00FFB3',
        ember:      '#FF6B35',
        'text-primary':   '#F0F4FF',
        'text-secondary': '#C8D8F0',
        'text-muted':     '#8899BB',
        'border-subtle':  '#1A2840',
      },
      fontFamily: {
        display: ['Syne','Cairo','sans-serif'],
        body:    ['DM Sans','Cairo','sans-serif'],
        mono:    ['JetBrains Mono','monospace'],
      },
      boxShadow: {
        electric:      '0 0 30px rgba(0,212,255,0.3)',
        'electric-sm': '0 0 12px rgba(0,212,255,0.2)',
        plasma:        '0 0 30px rgba(123,97,255,0.3)',
        'card-hover':  '0 8px 30px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 30% 0%, rgba(0,212,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(123,97,255,0.06) 0%, transparent 60%)',
        'grid': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
export default config
