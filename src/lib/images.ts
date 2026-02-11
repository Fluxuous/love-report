import { MultiPassResult } from "./curation/claude";

const OG_TIMEOUT = 4000;
const MAX_PARALLEL = 10;
const MAX_HTML_BYTES = 50000; // Only read first 50KB to find og:image

// Filter out generic/logo OG images that aren't real article images
const GENERIC_IMAGE_PATTERNS = [
  "google.com/images/branding",
  "news.google.com",
  "gstatic.com/images",
  "googleusercontent.com",
  "logo",
  "favicon",
  "icon",
  "default-og",
  "placeholder",
  "share-image",
  "og-default",
  "social-share",
  "brand",
];

function isGenericImage(url: string): boolean {
  const lower = url.toLowerCase();
  return GENERIC_IMAGE_PATTERNS.some((p) => lower.includes(p));
}

/** Check if an existing image_url is a known bad/generic image */
export function isBadImageUrl(url: string | undefined): boolean {
  if (!url) return true;
  return isGenericImage(url);
}

interface OgResult {
  imageUrl?: string;
  publishedDate?: string;
}

/**
 * Extract article:published_time or JSON-LD datePublished from HTML head.
 */
function extractPublishedDate(html: string): string | undefined {
  // <meta property="article:published_time" content="2023-04-15T..." />
  const metaMatch = html.match(
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i
  );
  if (metaMatch?.[1]) {
    const d = new Date(metaMatch[1]);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // JSON-LD: "datePublished": "2023-04-15T..."
  const jsonLdMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  if (jsonLdMatch?.[1]) {
    const d = new Date(jsonLdMatch[1]);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  return undefined;
}

async function fetchOgData(url: string): Promise<OgResult> {
  // Skip Google News URLs — can't reliably resolve to real article URLs
  if (url.includes("news.google.com")) return {};

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OG_TIMEOUT);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LoveReport/2.0 (positive news aggregator)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok || !res.body) return {};

    // Read only the head portion
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (totalBytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      totalBytes += value.length;
    }

    reader.cancel();

    const html = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0))
    );

    // Extract og:image
    let imageUrl: string | undefined;
    const ogMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );

    if (ogMatch?.[1]) {
      const img = ogMatch[1];
      if (img.startsWith("http") && !isGenericImage(img)) imageUrl = img;
    }

    // Fallback: twitter:image
    if (!imageUrl) {
      const twMatch = html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      ) || html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
      );
      if (twMatch?.[1] && twMatch[1].startsWith("http") && !isGenericImage(twMatch[1])) {
        imageUrl = twMatch[1];
      }
    }

    // Extract published date from the same HTML buffer (free)
    const publishedDate = extractPublishedDate(html);

    return { imageUrl, publishedDate };
  } catch {
    return {};
  }
}

const MAX_OG_SCRAPES = 5; // Only scrape a few — keeps pipeline fast and within budget

/**
 * Enrich curated stories with OG images.
 * - Strips known-bad images (Google logos etc.)
 * - Only scrapes a handful of non-Google-News stories to keep pipeline fast
 * - Prioritizes banner/top stories for image scraping
 */
export async function enrichWithOgImages(
  stories: MultiPassResult[]
): Promise<MultiPassResult[]> {
  // Strip known-bad images
  for (const story of stories) {
    if (story.image_url && isBadImageUrl(story.image_url)) {
      story.image_url = undefined;
    }
  }

  // Only scrape non-Google-News stories (Google News URLs can't be resolved reliably)
  // Prioritize by importance so banner/top stories get images first
  const scrapeable = stories
    .filter((s) => !s.image_url && !s.url.includes("news.google.com"))
    .sort((a, b) => (b.highest_good ?? b.importance) - (a.highest_good ?? a.importance))
    .slice(0, MAX_OG_SCRAPES);

  if (!scrapeable.length) {
    const haveImages = stories.filter((s) => s.image_url).length;
    console.log(`[OG] No scrapeable stories (${haveImages} already have images)`);
    return stories;
  }

  console.log(`[OG] Scraping OG data for ${scrapeable.length} top stories...`);

  const FRESHNESS_HOURS = 36;
  const freshnessCutoff = new Date(Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000).toISOString();
  const staleUrls = new Set<string>();

  let enriched = 0;
  const results = await Promise.allSettled(
    scrapeable.map(async (story) => {
      const ogData = await fetchOgData(story.url);
      if (ogData.imageUrl) {
        story.image_url = ogData.imageUrl;
        enriched++;
      }
      // If OG metadata reveals a stale article, flag it
      if (ogData.publishedDate) {
        // Use the older of existing published_at and OG date
        if (!story.published_at || ogData.publishedDate < story.published_at) {
          story.published_at = ogData.publishedDate;
        }
        if (story.published_at < freshnessCutoff) {
          console.log(`[OG] STALE detected: "${story.title}" published ${story.published_at}`);
          staleUrls.add(story.url);
        }
      }
    })
  );

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[OG] Scrape failed:", r.reason);
    }
  }

  console.log(`[OG] Enriched ${enriched}/${scrapeable.length} stories with OG images, ${staleUrls.size} stale filtered`);
  return staleUrls.size > 0
    ? stories.filter((s) => !staleUrls.has(s.url))
    : stories;
}
