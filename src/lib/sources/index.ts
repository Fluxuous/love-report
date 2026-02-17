import { RawStory } from "../types";
import { fetchFromNewsData } from "./newsdata";
import { fetchFromRss } from "./rss";

/** Fetch from all sources and deduplicate by URL */
export async function fetchAllSources(): Promise<RawStory[]> {
  const [newsDataStories, rssStories] = await Promise.allSettled([
    fetchFromNewsData(),
    fetchFromRss(),
  ]);

  const all: RawStory[] = [];

  if (newsDataStories.status === "fulfilled") {
    all.push(...newsDataStories.value);
  }
  if (rssStories.status === "fulfilled") {
    all.push(...rssStories.value);
  }

  // Deduplicate by URL and by title similarity
  // (Google News produces near-duplicate stories from different queries)
  const seenUrls = new Set<string>();
  const seenTitles: string[] = [];
  const unique: RawStory[] = [];

  for (const story of all) {
    // Normalize URL: strip trailing slash, strip query params for dedup
    const normalizedUrl = story.url.split("?")[0].replace(/\/$/, "");
    if (seenUrls.has(normalizedUrl)) continue;

    // Fuzzy title dedup: extract significant words (4+ chars), check overlap
    const normalizedTitle = story.title.toLowerCase().trim();
    const titleWords = new Set(normalizedTitle.split(/\s+/).filter(w => w.length >= 4));
    const isDuplicate = seenTitles.some(seen => {
      const seenWords = new Set(seen.split(/\s+/).filter(w => w.length >= 4));
      if (titleWords.size === 0 || seenWords.size === 0) return false;
      let overlap = 0;
      titleWords.forEach(w => { if (seenWords.has(w)) overlap++; });
      const smaller = Math.min(titleWords.size, seenWords.size);
      return smaller > 0 && overlap / smaller >= 0.6;
    });

    if (isDuplicate) continue;

    seenUrls.add(normalizedUrl);
    seenTitles.push(normalizedTitle);
    unique.push(story);
  }

  // Filter to stories published within the last 36 hours
  const freshnessCutoff = Date.now() - 36 * 60 * 60 * 1000;
  const fresh = unique.filter((story) => {
    if (!story.published_at) return false;
    const pubTime = new Date(story.published_at).getTime();
    if (isNaN(pubTime)) return false;
    return pubTime >= freshnessCutoff;
  });

  console.log(
    `[Sources] Total: ${all.length}, After dedup: ${unique.length}, After freshness filter (36h): ${fresh.length}`
  );
  return fresh;
}
