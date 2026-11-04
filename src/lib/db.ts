import { CuratedStory, Subscriber } from "./types";
import { MultiPassResult } from "./curation/claude";
import { isBadImageUrl } from "./images";
import crypto from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const IS_VERCEL = !!process.env.VERCEL;
const GIST_ID = process.env.GIST_ID || "d520253be8b5d0a4260192b75217fec0";
const GIST_FILENAME = "stories.json";
const SUBSCRIBERS_FILENAME = "subscribers.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_PATH = path.join(DATA_DIR, "stories.json");

// --- GitHub Gist storage (production) ---

async function readGistFile<T>(filename: string): Promise<T | null> {
  try {
    const res = await fetch(
      `https://api.github.com/gists/${GIST_ID}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const gist = await res.json();
    const content = gist.files?.[filename]?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (err) {
    console.error(`[DB] Failed to read gist file ${filename}:`, err);
    return null;
  }
}

async function writeGistFile(filename: string, data: unknown): Promise<void> {
  if (!GITHUB_TOKEN) {
    console.error("[DB] No GITHUB_TOKEN set, cannot write to gist");
    return;
  }
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [filename]: {
            content: JSON.stringify(data),
          },
        },
      }),
    });
    if (!res.ok) {
      console.error(`[DB] Failed to write gist file ${filename}:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[DB] Failed to write gist file ${filename}:`, err);
  }
}

// --- Local JSON file storage (dev) ---

function readLocalFile<T>(filename: string): T | null {
  try {
    const filepath = path.join(DATA_DIR, filename);
    if (!existsSync(filepath)) return null;
    return JSON.parse(readFileSync(filepath, "utf-8"));
  } catch {
    return null;
  }
}

function writeLocalFile(filename: string, data: unknown): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// --- Unified read/write ---

async function readAll(): Promise<CuratedStory[]> {
  if (IS_VERCEL) {
    return (await readGistFile<CuratedStory[]>(GIST_FILENAME)) || [];
  }
  return readLocalFile<CuratedStory[]>(GIST_FILENAME) || [];
}

async function writeAll(stories: CuratedStory[]): Promise<void> {
  if (IS_VERCEL) {
    await writeGistFile(GIST_FILENAME, stories);
  } else {
    writeLocalFile(GIST_FILENAME, stories);
  }
}

async function readSubscribers(): Promise<Subscriber[]> {
  if (IS_VERCEL) {
    return (await readGistFile<Subscriber[]>(SUBSCRIBERS_FILENAME)) || [];
  }
  return readLocalFile<Subscriber[]>(SUBSCRIBERS_FILENAME) || [];
}

async function writeSubscribers(subs: Subscriber[]): Promise<void> {
  if (IS_VERCEL) {
    await writeGistFile(SUBSCRIBERS_FILENAME, subs);
  } else {
    writeLocalFile(SUBSCRIBERS_FILENAME, subs);
  }
}

// --- Public API ---

export async function getActiveStories(): Promise<CuratedStory[]> {
  const stories = await readAll();
  // Display guard: never show stories older than 48h regardless of is_active
  const displayCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const active = stories
    .filter((s) => s.is_active && (!s.published_at || s.published_at >= displayCutoff))
    .map((s) => {
      // Strip known-bad images (Google logos etc.) from stored data
      if (s.image_url && isBadImageUrl(s.image_url)) {
        return { ...s, image_url: undefined };
      }
      return s;
    })
    .sort((a, b) => {
      if (a.is_headline && !b.is_headline) return -1;
      if (!a.is_headline && b.is_headline) return 1;
      const aScore = a.highest_good ?? a.importance;
      const bScore = b.highest_good ?? b.importance;
      return bScore - aScore;
    });

  // Fuzzy dedup on display titles — catches same news event curated across runs
  const deduped: CuratedStory[] = [];
  const seenTitles: string[] = [];
  for (const story of active) {
    const lower = story.display_title.toLowerCase().trim();
    const words = new Set(lower.split(/\s+/).filter(w => w.length >= 4));
    const isDupe = seenTitles.some(seen => {
      const seenWords = new Set(seen.split(/\s+/).filter(w => w.length >= 4));
      if (words.size === 0 || seenWords.size === 0) return false;
      let overlap = 0;
      words.forEach(w => { if (seenWords.has(w)) overlap++; });
      const smaller = Math.min(words.size, seenWords.size);
      return smaller > 0 && overlap / smaller >= 0.5;
    });
    if (!isDupe) {
      deduped.push(story);
      seenTitles.push(lower);
    }
  }

  return deduped.slice(0, 100);
}

export async function upsertStories(
  newStories: MultiPassResult[]
): Promise<number> {
  const existing = await readAll();
  const now = new Date().toISOString();

  // Clear old headline flags
  for (const s of existing) {
    s.is_headline = false;
  }

  const byUrl = new Map(existing.map((s) => [s.url, s]));
  let inserted = 0;

  for (const story of newStories) {
    const id = crypto
      .createHash("md5")
      .update(story.url)
      .digest("hex")
      .slice(0, 12);

    byUrl.set(story.url, {
      id,
      title: story.title,
      display_title: story.display_title,
      url: story.url,
      source: story.source,
      category: story.category,
      importance: story.importance,
      summary: story.summary,
      tier: story.tier,
      column: story.column,
      image_url: story.image_url,
      published_at: story.published_at || now,
      curated_at: now,
      is_headline: story.is_headline,
      is_active: true,
      ai_scores: story.ai_scores,
      highest_good: story.highest_good,
    });
    inserted++;
  }

  await writeAll(Array.from(byUrl.values()));
  return inserted;
}

export async function archiveOldStories(hoursOld: number = 48): Promise<number> {
  const stories = await readAll();
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
  let archived = 0;

  for (const story of stories) {
    if (story.is_active) {
      if (story.published_at && story.published_at < cutoff) {
        console.log(`[DB] Archiving by published_at: "${story.title}" (${story.published_at})`);
        story.is_active = false;
        archived++;
      } else if (story.curated_at < cutoff) {
        story.is_active = false;
        archived++;
      }
    }
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const filtered = stories.filter((s) => s.curated_at >= weekAgo);

  await writeAll(filtered);
  return archived;
}

export async function getStoryCount(): Promise<number> {
  const stories = await getActiveStories();
  return stories.length;
}

// --- Subscriber API ---

export async function addSubscriber(email: string): Promise<{ ok: boolean; message: string }> {
  const normalized = email.toLowerCase().trim();
  const subs = await readSubscribers();
  const existing = subs.find((s) => s.email === normalized);
  if (existing) {
    return { ok: true, message: "Already subscribed" };
  }
  subs.push({
    email: normalized,
    subscribed_at: new Date().toISOString(),
    confirmed: true, // Skip double opt-in for MVP (Resend handles bounce/complaint)
  });
  await writeSubscribers(subs);
  return { ok: true, message: "Subscribed" };
}

export async function removeSubscriber(email: string): Promise<{ ok: boolean; message: string }> {
  const normalized = email.toLowerCase().trim();
  const subs = await readSubscribers();
  const filtered = subs.filter((s) => s.email !== normalized);
  if (filtered.length === subs.length) {
    return { ok: false, message: "Not found" };
  }
  await writeSubscribers(filtered);
  return { ok: true, message: "Unsubscribed" };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const subs = await readSubscribers();
  return subs.filter((s) => s.confirmed);
}

export async function getSubscriberCount(): Promise<number> {
  const subs = await getSubscribers();
  return subs.length;
}
