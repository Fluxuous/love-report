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

async function fetchOgImage(url: string): Promise<string | undefined> {
  // Skip Google News URLs — can't reliably resolve to real article URLs
  if (url.includes("news.google.com")) return undefined;

  try {
    const scrapeUrl = url;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OG_TIMEOUT);

    const res = await fetch(scrapeUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LoveReport/2.0 (positive news aggregator)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok || !res.body) return undefined;

    // Read only the head portion to find og:image
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
    const ogMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );

    if (ogMatch?.[1]) {
      const imgUrl = ogMatch[1];
      if (imgUrl.startsWith("http") && !isGenericImage(imgUrl)) return imgUrl;
    }

    // Fallback: twitter:image
    const twMatch = html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
    );

    if (twMatch?.[1] && twMatch[1].startsWith("http") && !isGenericImage(twMatch[1])) return twMatch[1];

    return undefined;
  } catch {
    return undefined;
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
    .sort((a, b) => b.importance - a.importance)
    .slice(0, MAX_OG_SCRAPES);

  if (!scrapeable.length) {
    const haveImages = stories.filter((s) => s.image_url).length;
    console.log(`[OG] No scrapeable stories (${haveImages} already have images)`);
    return stories;
  }

  console.log(`[OG] Scraping OG images for ${scrapeable.length} top stories...`);

  let enriched = 0;
  const results = await Promise.allSettled(
    scrapeable.map(async (story) => {
      const imgUrl = await fetchOgImage(story.url);
      if (imgUrl) {
        story.image_url = imgUrl;
        enriched++;
      }
    })
  );

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[OG] Scrape failed:", r.reason);
    }
  }

  console.log(`[OG] Enriched ${enriched}/${scrapeable.length} stories with OG images`);
  return stories;
}
