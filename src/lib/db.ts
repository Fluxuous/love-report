import { CuratedStory } from "./types";
import { MultiPassResult } from "./curation/claude";
import { isBadImageUrl } from "./images";
import crypto from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const IS_VERCEL = !!process.env.VERCEL;
const GIST_ID = process.env.GIST_ID || "d520253be8b5d0a4260192b75217fec0";
const GIST_FILENAME = "stories.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_PATH = path.join(DATA_DIR, "stories.json");

// --- GitHub Gist storage (production) ---

async function readGist(): Promise<CuratedStory[]> {
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
    if (!res.ok) return [];
    const gist = await res.json();
    const content = gist.files?.[GIST_FILENAME]?.content;
    if (!content) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error("[DB] Failed to read gist:", err);
    return [];
  }
}

async function writeGist(stories: CuratedStory[]): Promise<void> {
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
          [GIST_FILENAME]: {
            content: JSON.stringify(stories),
          },
        },
      }),
    });
    if (!res.ok) {
      console.error("[DB] Failed to write gist:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[DB] Failed to write gist:", err);
  }
}

// --- Local JSON file storage (dev) ---

function readLocal(): CuratedStory[] {
  try {
    if (!existsSync(JSON_PATH)) return [];
    return JSON.parse(readFileSync(JSON_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeLocal(stories: CuratedStory[]): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(JSON_PATH, JSON.stringify(stories, null, 2));
}

// --- Unified read/write ---

async function readAll(): Promise<CuratedStory[]> {
  return IS_VERCEL ? readGist() : readLocal();
}

async function writeAll(stories: CuratedStory[]): Promise<void> {
  if (IS_VERCEL) {
    await writeGist(stories);
  } else {
    writeLocal(stories);
  }
}

// --- Public API ---

export async function getActiveStories(): Promise<CuratedStory[]> {
  const stories = await readAll();
  return stories
    .filter((s) => s.is_active)
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
    })
    .slice(0, 100);
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
      published_at: now,
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
    if (story.is_active && story.curated_at < cutoff) {
      story.is_active = false;
      archived++;
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
