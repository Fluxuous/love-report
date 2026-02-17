import { RawStory } from "../types";

const NEWSDATA_BASE = "https://newsdata.io/api/1/latest";

const POSITIVE_QUERIES = [
  "breakthrough OR milestone OR innovation",
  "rescued OR saved OR recovery",
  "community OR volunteer OR mutual aid",
  "renewable energy OR solar OR wind power",
  "species recovery OR conservation success",
  "medical cure OR treatment advance",
  "human rights victory OR civil rights",
  "peace OR ceasefire OR reconciliation",
  "rewilding OR reforestation OR restoration",
  "indigenous rights OR land rights victory",
  "protest victory OR court ruling justice",
  "regenerative agriculture OR permaculture",
];

interface NewsDataArticle {
  title: string;
  link: string;
  source_id: string;
  image_url?: string;
  pubDate?: string;
  description?: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export async function fetchFromNewsData(): Promise<RawStory[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey || apiKey === "your_newsdata_api_key_here") {
    console.log("[NewsData] No API key configured, skipping");
    return [];
  }

  const stories: RawStory[] = [];

  for (const query of POSITIVE_QUERIES) {
    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        q: query,
        language: "en",
        size: "10",
      });

      const res = await fetch(`${NEWSDATA_BASE}?${params}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        console.error(`[NewsData] HTTP ${res.status} for query: ${query}`);
        continue;
      }

      const data: NewsDataResponse = await res.json();

      if (data.results) {
        for (const article of data.results) {
          if (article.title && article.link) {
            stories.push({
              title: article.title,
              url: article.link,
              source: article.source_id || "newsdata",
              image_url: article.image_url || undefined,
              published_at: article.pubDate || undefined,
              description: article.description || undefined,
            });
          }
        }
      }
    } catch (err) {
      console.error(`[NewsData] Error fetching query "${query}":`, err);
    }
  }

  console.log(`[NewsData] Fetched ${stories.length} stories`);
  return stories;
}
