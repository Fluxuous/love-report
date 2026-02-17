# Love Report — Roadmap

## Status Key
- **Built** — shipped and live
- **Current** — actively being worked on
- **Planned** — scoped, not yet started
- **Idea** — exploratory, no commitment

---

## v1.0 — MVP [Built]

Basic positive news aggregator. Fetches from NewsData.io and RSS feeds, uses Claude AI to curate ~30 stories, displays in a simple layout. GitHub Gist for storage, Vercel Hobby for hosting.

- Multi-source ingestion (NewsData.io + RSS feeds)
- Claude-powered story curation with keyword pre-filtering
- GitHub Gist as persistent JSON store
- Daily cron refresh
- Basic responsive layout

## v2.0 — Drudge Report Clone [Built]

Complete redesign as a Drudge Report-style news aggregator for positive news. Multi-pass AI curation pipeline with tiered layout (banner, top, above-fold, three columns, bottom bar).

- Drudge Report visual style with raw CSS
- Multi-pass Claude curation: 4 batch + 2 final ranking
- Story tiers: banner, top, above-fold, column, bottom-bar
- OG image scraping for hero images
- ~47 Google News RSS queries + 15 RSS feeds
- Freshness filtering (36-hour window with URL date extraction)
- Title case display titles

## v2.1 — Highest Good Scoring [Built]

Eight ethical dimensions scored by AI for every curated story. Score badge with hover/long-press tooltips. About page explains the philosophical framework.

- 8 dimensions: Courage, Impact, Justice, Compassion, Harmony, Grace, Truth, Transcendence
- Weighted composite score (0.0–10.0, Pitchfork-style)
- Score tooltip on hover (desktop) / long-press (mobile)
- Full About page with philosophical roots, tensions, methodology
- Backward compatible with unscored stories

## v2.2 — Story Quality Improvements [Built]

Five improvements to curation quality, plus pipeline optimization. All free.

1. **Pass RSS descriptions to Claude** — scoring 8 dimensions from headlines alone is guessing; adding 1-2 sentence descriptions makes it judgment
2. **Spike bonus in scoring** — `composite = weightedAvg * 0.7 + maxDimension * 0.3` so exceptional stories aren't buried by mediocre-but-broad ones
3. **Fix negative keyword filter** — `arrest`, `charged`, `guilty`, `war` no longer hard-block justice/accountability stories
4. **Add 11 direct RSS feeds** — Global South (Al Jazeera, Rest of World, Global Voices, The New Humanitarian), science (The Conversation, ScienceDaily), environment (Guardian, Grist, Canary Media), justice (The 19th), development (Devex)
5. **Pass scores + summaries to final ranking** — score-to-tier guidance for accurate placement
6. **Fuzzy title dedup** — catches near-duplicate stories from different Google News queries
7. **Trim Google News queries** (47 → 27) — merged redundant queries to reclaim time budget

## v2.3 — Daily Newsletter [Current]

Automated daily digest via Resend (free tier, 100 emails/day). Subscribers stored in the Gist. Zero cost to start, upgrade path to Buttondown or Beehiiv when subscriber count justifies it.

- Top stories by Highest Good score with score badges
- "Tension of the Day" — stories where ethical dimensions conflict (Grace vs Justice, etc.)
- Subscribe/unsubscribe flow on Love Report site
- Direct NGO ad placement slots (hand-curated, not programmatic)
- External cron (cron-job.org, free) for daily send since Vercel Hobby only allows 1 cron
- Monetization path: free tier → paid subscriptions → direct NGO ad placements

## Infrastructure: Vercel Pro Upgrade [Planned — pending revenue]

Upgrade to Vercel Pro ($20/mo) when revenue justifies it. Gives 300s maxDuration (vs 60s), multiple cron schedules, and headroom for pipeline enhancements. See `docs/decisions/2026-02-17-vercel-pro-upgrade.md`.

## v2.4 — Quality Testing & Polish [Planned]

1-2 week bake period. Run the improved pipeline daily, manually review outputs, tune prompts and weights, fix newsletter formatting issues. Not a feature phase — a quality gate before going public.

## v2.5 — Marketing & Promotion [Planned]

Soft launch to personal network → social media → newsletter directories → cross-promotion with aligned newsletters → content marketing about the Highest Good framework.

## v3 — Human Scoring (Rotten Tomatoes Model) [Planned]

Readers vote on each dimension for each story, creating a collective moral judgment alongside the AI's scores.

- **AI Score**: Consistent, scalable, philosophically grounded but ultimately synthetic
- **Human Score**: Messy, diverse, grounded in lived experience
- **The Gap**: Where AI and humans agree — and where they diverge — is itself data

The site becomes not just a mirror but a participatory experiment in collective ethics.

## v3+ — Future Ideas

- **Nonprofit Ad Network**: Hand-curated ads for genuine nonprofits only. Revenue sustains the project with editorial integrity.
- **Custom Dimension Weighting**: Readers adjust weights to reflect their own values
- **Dimension Filtering**: "Show me the most courageous stories" / "Show me the most just stories"
- **User Accounts**: Save weights, bookmark stories, personal moral profile over time
- **API**: Let other sites embed Highest Good scores
- **Embeddable Score Widget**: A small badge any news site can add
- **Highest Good Leaderboard**: Which sources consistently produce the highest-scored stories?
- **Historical Archive**: Searchable archive of scored stories, trends over time
- **Podcast/Audio**: Weekly audio digest of the highest-scored stories
