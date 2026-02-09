import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/sources";
import { keywordPreFilter } from "@/lib/curation/keywords";
import { curateWithClaude } from "@/lib/curation/claude";
import { upsertStories, archiveOldStories, getStoryCount } from "@/lib/db";

export const maxDuration = 60; // Allow up to 60s for the full pipeline
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (
    cronSecret &&
    cronSecret !== "local-dev-secret" &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];

  try {
    // Step 1: Fetch from all sources
    log.push("Fetching from all sources...");
    const rawStories = await fetchAllSources();
    log.push(`Fetched ${rawStories.length} raw stories`);

    // Step 2: Keyword pre-filter
    const candidates = keywordPreFilter(rawStories, 100);
    log.push(`Keyword filter: ${candidates.length} candidates`);

    // Step 3: AI curation with Claude
    log.push("Sending to Claude for curation...");
    const curated = await curateWithClaude(candidates);
    log.push(`Claude selected ${curated.length} stories`);

    // Step 4: Upsert into database
    const inserted = await upsertStories(curated);
    log.push(`Upserted ${inserted} stories into DB`);

    // Step 5: Archive old stories
    const archived = await archiveOldStories(48);
    log.push(`Archived ${archived} stories older than 48h`);

    const totalActive = await getStoryCount();
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      pipeline: {
        raw: rawStories.length,
        filtered: candidates.length,
        curated: curated.length,
        inserted,
        archived,
        totalActive,
        elapsed: `${elapsed}ms`,
      },
      log,
    });
  } catch (err) {
    console.error("[Cron] Pipeline error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        log,
      },
      { status: 500 }
    );
  }
}
