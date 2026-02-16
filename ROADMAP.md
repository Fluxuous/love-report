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

## v2.2 — Newsletter [Planned]

Email digest with top-scored stories. Weekly or daily frequency option. Highlights the most interesting dimension tensions of the week — not just highest scores, but stories where Grace and Justice pulled in opposite directions, or where Courage and Harmony collided.

## v2.3 — Nonprofit Ad Network [Planned]

Hand-curated advertisements for genuine nonprofits only. No programmatic ads. No tracking pixels. No behavioral targeting. Strict editorial requirements: the nonprofit must demonstrate real impact, not just good marketing.

Revenue sustains the project as a nonprofit entity with a modest founder salary. The ads themselves are curated with the same editorial philosophy as the stories.

## v3 — Human Scoring (Rotten Tomatoes Model) [Planned]

Readers vote on each dimension for each story, creating a collective moral judgment alongside the AI's scores.

- **AI Score**: Consistent, scalable, philosophically grounded but ultimately synthetic
- **Human Score**: Messy, diverse, grounded in lived experience
- **The Gap**: Where AI and humans agree — and where they diverge — is itself data

The site becomes not just a mirror but a participatory experiment in collective ethics.

## v3.1 — Additional Metric Sets [Idea]

- Deontological vs. utilitarian axis
- Custom user weighting (adjust dimension weights to reflect your own values)
- "Show me the most courageous stories" / "Show me the most just stories" filtering

## v3.2 — User Accounts & Personalization [Idea]

- Save preferred weights
- Bookmark stories
- Scoring history
- Personal moral profile over time

## Future Ideas

- **API**: Let other sites embed Highest Good scores
- **Embeddable Score Widget**: A small badge any news site can add
- **Highest Good Leaderboard**: Which sources consistently produce the highest-scored stories?
- **Historical Archive**: Searchable archive of scored stories, trends over time
- **Podcast/Audio**: Weekly audio digest of the highest-scored stories
