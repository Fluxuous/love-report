# Love Report — Project Instructions

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Raw CSS (`globals.css`) — no Tailwind, no CSS-in-JS. Drudge Report clone aesthetic.
- **AI**: Anthropic Claude Haiku 4.5 for multi-pass curation + ethical scoring
- **Storage**: GitHub Gist as JSON key-value store (no database)
- **Hosting**: Vercel Hobby tier (free)

## Architecture

```
src/
  app/
    page.tsx              — Main page, fetches stories from /api/stories
    about/page.tsx        — Highest Good philosophical framework
    layout.tsx            — Root layout
    globals.css           — All styles
    api/
      cron/curate/route.ts — Curation pipeline (runs daily via Vercel cron)
      stories/route.ts     — GET endpoint, reads from Gist
  components/
    Banner.tsx            — Hero story with image
    Header.tsx            — Site header
    Footer.tsx            — Site footer
    TopStories.tsx        — Top story section
    DrudgeColumn.tsx      — Three-column layout
    ScoreBadge.tsx        — Ethical score display
    ScoreTooltip.tsx      — Dimension breakdown on hover/tap
    ScoreToggle.tsx       — Show/hide scores
  lib/
    types.ts              — All TypeScript interfaces
    db.ts                 — Gist read/write operations
    format.ts             — Title case, text formatting
    images.ts             — OG image scraping
    curation/
      claude.ts           — Claude API calls (batch + final ranking)
      keywords.ts         — Pre-filter keyword list
      scoring.ts          — Ethical dimension scoring
    sources/
      index.ts            — Source aggregation
      newsdata.ts         — NewsData.io API
      rss.ts              — RSS feed parsing
```

## Critical Constraints

- **Vercel Hobby maxDuration = 60s**. The full pipeline must complete in ~50s. Always add time budget guards.
- **Claude returns trailing text after JSON**. Use bracket-matching extraction (`extractJsonArray`), never `JSON.parse(text.trim())`.
- **Rate limiting**: Run Claude batch calls in 2 waves of 2, not 4 parallel.
- **Google News RSS**: URLs are encrypted protobuf tokens (post-2025). Cannot decode to real article URLs. OG scraping impossible. Strip `image_url` from Google News items at parse time — `media:content` always returns the Google logo.
- **Gist caching**: Always read via `api.github.com/gists/{id}`, never `gist.githubusercontent.com` (aggressively cached CDN).
- **OG scraping budget**: Max ~5 non-Google-News stories per run.
- **Vercel Hobby cron**: Limited to daily. Currently set to `0 8 * * *`.

## Env Vars

Set in Vercel dashboard and `.env.local`:
- `ANTHROPIC_API_KEY`
- `NEWSDATA_API_KEY`
- `GITHUB_TOKEN` (for Gist writes, needs `gist` scope)

## Dev Setup

```bash
npm install
cp .env.local.example .env.local  # fill in API keys
npm run dev
```

## Deployment

Push to `main` → auto-deploys on Vercel.

Gist ID: `d520253be8b5d0a4260192b75217fec0`
