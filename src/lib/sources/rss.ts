import Parser from "rss-parser";
import { RawStory } from "../types";

// Configure parser to extract image fields from RSS
const parser = new Parser({
  timeout: 5000,
  headers: {
    "User-Agent": "LoveReport/2.0 (positive news aggregator)",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure", { keepArray: false }],
    ],
  },
});

const CURATED_FEEDS = [
  // Positive news aggregators
  { url: "https://www.goodnewsnetwork.org/feed/", name: "Good News Network" },
  { url: "https://www.positive.news/feed/", name: "Positive News" },
  { url: "https://reasonstobecheerful.world/feed/", name: "Reasons to be Cheerful" },
  { url: "https://www.yesmagazine.org/feed", name: "YES! Magazine" },
  { url: "https://www.thehappybroadcast.com/feed", name: "The Happy Broadcast" },
  { url: "https://www.reddit.com/r/UpliftingNews/.rss", name: "r/UpliftingNews" },
  // Science & nature
  { url: "https://www.nasa.gov/news-release/feed/", name: "NASA" },
  { url: "https://news.mongabay.com/feed/", name: "Mongabay" },
  { url: "https://www.rewild.org/feed", name: "Re:wild" },
  // Human rights & justice
  { url: "https://www.amnesty.org/en/latest/rss.xml", name: "Amnesty International" },
  { url: "https://www.hrw.org/rss/news_and_commentary", name: "Human Rights Watch" },
  { url: "https://www.eff.org/rss/updates.xml", name: "EFF" },
  // Global development
  { url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", name: "UN News" },
  // Indigenous & land rights
  { url: "https://www.reddit.com/r/solarpunk/.rss", name: "r/solarpunk" },
  { url: "https://www.reddit.com/r/rewilding/.rss", name: "r/rewilding" },
];

const GOOGLE_NEWS_QUERIES = [
  // Science (keep lean — 3 queries, not 4)
  "scientific breakthrough discovery",
  "medical breakthrough cure",
  "renewable energy record milestone",

  // Nature healing & rewilding (global)
  "species recovery endangered saved",
  "rewilding restoration ecosystem recovery",
  "ocean cleanup coral reef recovery",
  "reforestation success trees planted",
  "wildlife conservation victory",

  // Human rights & resistance (global)
  "human rights victory court ruling",
  "political prisoner freed released",
  "protest victory civil rights won",
  "indigenous land rights victory",
  "workers union victory strike won",
  "whistleblower vindicated wins",
  "community defeats corporation pipeline",
  "refugees welcomed sanctuary",

  // Heroism & courage (everyday people, not military)
  "heroic rescue saves lives",
  "teenager saves drowning",
  "bystander rescues stranger",
  "teen hero rescue",
  "man saves child from",
  "woman rescues family from",
  "neighbor saves house fire",
  "good samaritan rescues",
  "survived against odds miracle",

  // Peace & civilization healing (global)
  "peace agreement ceasefire signed",
  "reconciliation former enemies",
  "restorative justice success",
  "truth commission progress",
  "reparations justice historic",

  // Living with nature
  "regenerative agriculture harvest",
  "indigenous ecological knowledge",
  "community garden urban farm",
  "permaculture food forest",

  // Global development & dignity
  "poverty reduction milestone",
  "clean water village access",
  "education girls school access",
  "humanitarian aid delivers",
  "mutual aid community support",
  "cooperative worker owned",

  // Africa, Asia, Latin America, Pacific specific
  "Africa breakthrough innovation",
  "India community victory progress",
  "Latin America indigenous rights victory",
  "Pacific islands climate resilience",
  "Southeast Asia conservation success",
];

function googleNewsRssUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:1d")}&hl=en-US&gl=US&ceid=US:en`;
}

function extractImageUrl(item: Record<string, Record<string, Record<string, string>>>): string | undefined {
  try {
    // Try media:content
    const mc = item.mediaContent;
    if (mc) {
      const url = mc.$?.url || (mc as unknown as Record<string, string>).url;
      if (url) return url;
    }

    // Try media:thumbnail
    const mt = item.mediaThumbnail;
    if (mt) {
      const url = mt.$?.url || (mt as unknown as Record<string, string>).url;
      if (url) return url;
    }

    // Try enclosure (if it's an image type)
    const enc = item.enclosure;
    if (enc) {
      const type = (enc as unknown as Record<string, string>).type || enc.$?.type || "";
      const url = (enc as unknown as Record<string, string>).url || enc.$?.url;
      if (url && (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)/i.test(url))) {
        return url;
      }
    }
  } catch {
    // ignore extraction errors
  }

  return undefined;
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
        // Google News RSS always returns the Google News logo — never use it
        image_url: sourceName.startsWith("Google News") ? undefined : extractImageUrl(item as never),
        published_at: item.pubDate || item.isoDate || undefined,
      }));
  } catch (err) {
    console.error(`[RSS] Error fetching ${sourceName} (${url}):`, err);
    return [];
  }
}

export async function fetchFromRss(): Promise<RawStory[]> {
  const feedPromises: Promise<RawStory[]>[] = [];

  for (const feed of CURATED_FEEDS) {
    feedPromises.push(fetchFeed(feed.url, feed.name));
  }

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

  const withImages = stories.filter((s) => s.image_url).length;
  console.log(`[RSS] Fetched ${stories.length} stories (${withImages} with images) from ${CURATED_FEEDS.length + GOOGLE_NEWS_QUERIES.length} feeds`);
  return stories;
}
