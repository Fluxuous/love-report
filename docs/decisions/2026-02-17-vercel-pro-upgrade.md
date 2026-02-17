# Vercel Pro Upgrade — Pipeline Time Budget

**Date**: 2026-02-17
**Status**: Planned (pending revenue)
**Relates to**: ROADMAP.md — Infrastructure

## Context

The curation pipeline runs at ~58s on Vercel Hobby (60s limit). Adding RSS descriptions and 11 new feeds pushed it to the edge — OG image scraping had to be skipped. The newsletter will need additional time per run.

## Decision

Upgrade to Vercel Pro ($20/mo) when the project generates revenue. This gives:
- **300s maxDuration** (5x current limit)
- **Multiple cron schedules** (needed for newsletter send separate from curation)
- Headroom for future pipeline enhancements (article content fetching, more Claude passes)

## Interim Mitigations

While staying on Hobby:
- Trimmed Google News queries from 47 → 27 (merged redundant queries)
- Fuzzy title dedup reduces duplicate stories hitting Claude
- OG scraping has a time budget guard (skips if >45s elapsed)
- Newsletter send will use an external free cron (cron-job.org) since Hobby only allows 1 cron

## Alternatives Considered

| Approach | Cost | Complexity | Notes |
|----------|------|------------|-------|
| **Vercel Pro** | $20/mo | Low | Clean solution. Decided for future. |
| Chained functions | $0 | High | Split pipeline into 3 endpoints with Gist as intermediate state. Works but fragile. |
| GitHub Actions | $0 | Medium | Move pipeline to CI. 6hr limit. Pipeline logic lives outside Vercel. |
