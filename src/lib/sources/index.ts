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

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique: RawStory[] = [];

  for (const story of all) {
    // Normalize URL: strip trailing slash, strip query params for dedup
    const normalizedUrl = story.url.split("?")[0].replace(/\/$/, "");
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      unique.push(story);
    }
  }

  console.log(
    `[Sources] Total: ${all.length}, After dedup: ${unique.length}`
  );
  return unique;
}
