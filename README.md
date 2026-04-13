# ⚡ Baytzaki — Smart Home Store Egypt

Egypt's leading smart home products store. Built with Next.js 14, deployed on Vercel.

**Live:** [baytzaki.com](https://baytzaki.com)

## Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom design system  
- **AI:** GPT-4o (OpenAI) → Groq Llama 3.3 70B (fallback)
- **Deployment:** Vercel

## Features
- 🛍️ Full e-commerce — 69+ products, cart, WhatsApp checkout
- 🎬 Hook video — First-visit YouTube popup (admin-configurable)
- 🤖 ARIA AI — Smart home product finder (GPT-4o → Groq)
- 🔗 URL Importer — Scrape products from any external URL
- 📦 Admin panel — Products CRUD, orders, settings, WP export
- 🎥 Arabic install videos — Per-product YouTube tutorials
- 🌍 WordPress export — WooCommerce CSV + XML

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

## Environment Variables

```
OPENAI_API_KEY=sk-proj-...         # GPT-4o (primary AI)
GROQ_API_KEY=gsk_...               # Llama 3.3 (free fallback)
NEXT_PUBLIC_ADMIN_PASSWORD=baytzaki2025
```

**Get keys:**
- OpenAI: https://platform.openai.com/api-keys
- Groq (free): https://console.groq.com

## Deploy

```bash
npx vercel
```

Add env vars in Vercel dashboard → auto-deploys on every `git push`.

## Admin Panel
Visit `/admin` → password = `NEXT_PUBLIC_ADMIN_PASSWORD`
