# Love Report

A positive news aggregator styled after the Drudge Report. AI-curated stories scored on eight ethical dimensions using a philosophical framework called the Highest Good.

**Live**: https://love-report-rosy.vercel.app

## What It Does

1. Aggregates positive news from ~60+ sources (NewsData.io, RSS feeds, Google News)
2. Claude AI curates ~30 stories into a tiered Drudge-style layout
3. Each story is scored on 8 ethical dimensions: Courage, Impact, Justice, Compassion, Harmony, Grace, Truth, Transcendence
4. Composite "Highest Good" score (0.0–10.0) displayed as a badge with dimension breakdown on hover

## Stack

Next.js 14 · Raw CSS · Claude Haiku 4.5 · GitHub Gist (storage) · Vercel Hobby

## Development

```bash
npm install
cp .env.local.example .env.local  # ANTHROPIC_API_KEY, NEWSDATA_API_KEY, GITHUB_TOKEN
npm run dev
```

## License

All rights reserved.
