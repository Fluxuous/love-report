import Parser from "rss-parser";
import { RawStory } from "../types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "LoveReport/1.0 (positive news aggregator)",
  },
});

const CURATED_FEEDS = [
  {
    url: "https://www.goodnewsnetwork.org/feed/",
    name: "Good News Network",
  },
  {
    url: "https://www.positive.news/feed/",
    name: "Positive News",
  },
  {
    url: "https://reasonstobecheerful.world/feed/",
    name: "Reasons to be Cheerful",
  },
];

// Google News RSS with positive topic searches
const GOOGLE_NEWS_QUERIES = [
  "scientific breakthrough",
  "community kindness",
  "environmental progress",
  "medical breakthrough",
  "innovation achievement",
];

function googleNewsRssUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

async function fetchFeed(
  url: string,
  sourceName: string
): Promise<RawStory[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        source: sourceName,
        published_at: item.pubDate || item.isoDate || undefined,
      }));
  } catch (err) {
    console.error(`[RSS] Error fetching ${sourceName} (${url}):`, err);
    return [];
  }
}

export async function fetchFromRss(): Promise<RawStory[]> {
  const feedPromises: Promise<RawStory[]>[] = [];

  // Curated positive news feeds
  for (const feed of CURATED_FEEDS) {
    feedPromises.push(fetchFeed(feed.url, feed.name));
  }

  // Google News RSS searches
  for (const query of GOOGLE_NEWS_QUERIES) {
    feedPromises.push(
      fetchFeed(googleNewsRssUrl(query), `Google News: ${query}`)
    );
  }

  const results = await Promise.allSettled(feedPromises);
  const stories: RawStory[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      stories.push(...result.value);
    }
  }

  console.log(`[RSS] Fetched ${stories.length} stories from ${CURATED_FEEDS.length + GOOGLE_NEWS_QUERIES.length} feeds`);
  return stories;
}
