import initSqlJs, { Database } from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { CuratedStory, ClaudeCurationResult } from "./types";
import crypto from "crypto";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "love-report.db");

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      source TEXT,
      category TEXT,
      importance INTEGER,
      summary TEXT,
      image_url TEXT,
      published_at TEXT,
      curated_at TEXT,
      is_headline INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_stories_active
    ON stories(is_active, importance DESC)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_stories_date
    ON stories(curated_at DESC)
  `);

  return db;
}

function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

export async function upsertStories(
  stories: ClaudeCurationResult[]
): Promise<number> {
  const database = await getDb();
  const now = new Date().toISOString();
  let inserted = 0;

  // Clear current headline flag
  database.run("UPDATE stories SET is_headline = 0 WHERE is_headline = 1");

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO stories
      (id, title, url, source, category, importance, summary, image_url, published_at, curated_at, is_headline, is_active)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const story of stories) {
    const id = crypto
      .createHash("md5")
      .update(story.url)
      .digest("hex")
      .slice(0, 12);

    try {
      stmt.run([
        id,
        story.title,
        story.url,
        "", // source gets lost in curation, that's ok for MVP
        story.category,
        story.importance,
        story.summary,
        null,
        now,
        now,
        story.is_headline ? 1 : 0,
      ]);
      inserted++;
    } catch {
      // Duplicate URL, skip
    }
  }

  stmt.free();
  saveDb();
  return inserted;
}

export async function getActiveStories(): Promise<CuratedStory[]> {
  const database = await getDb();

  const results = database.exec(`
    SELECT id, title, url, source, category, importance, summary,
           image_url, published_at, curated_at, is_headline, is_active
    FROM stories
    WHERE is_active = 1
    ORDER BY is_headline DESC, importance DESC
    LIMIT 50
  `);

  if (!results.length || !results[0].values.length) {
    return [];
  }

  return results[0].values.map((row) => ({
    id: row[0] as string,
    title: row[1] as string,
    url: row[2] as string,
    source: row[3] as string,
    category: row[4] as string as CuratedStory["category"],
    importance: row[5] as number,
    summary: row[6] as string,
    image_url: (row[7] as string) || undefined,
    published_at: row[8] as string,
    curated_at: row[9] as string,
    is_headline: (row[10] as number) === 1,
    is_active: (row[11] as number) === 1,
  }));
}

export async function archiveOldStories(hoursOld: number = 48): Promise<number> {
  const database = await getDb();
  const cutoff = new Date(
    Date.now() - hoursOld * 60 * 60 * 1000
  ).toISOString();

  database.run("UPDATE stories SET is_active = 0 WHERE curated_at < ?", [
    cutoff,
  ]);

  saveDb();

  const result = database.exec(
    "SELECT changes() as count"
  );
  return result.length ? (result[0].values[0][0] as number) : 0;
}

export async function getStoryCount(): Promise<number> {
  const database = await getDb();
  const result = database.exec(
    "SELECT COUNT(*) FROM stories WHERE is_active = 1"
  );
  return result.length ? (result[0].values[0][0] as number) : 0;
}
