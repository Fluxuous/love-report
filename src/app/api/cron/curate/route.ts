import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/sources";
import { keywordPreFilter } from "@/lib/curation/keywords";
import { curateWithClaude, getLastDiagnostics, getBatchErrors } from "@/lib/curation/claude";
import { enrichWithOgImages } from "@/lib/images";
import { upsertStories, archiveOldStories, getStoryCount } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    // Step 2: Keyword pre-filter to 200 candidates
    const candidates = keywordPreFilter(rawStories, 200);
    log.push(`Keyword filter: ${candidates.length} candidates`);

    // Step 3: Multi-pass AI curation with Claude
    log.push("Running multi-pass Claude curation (4 batch + 1 final)...");
    const curated = await curateWithClaude(candidates);
    log.push(`Claude curated ${curated.length} stories with tiers and display titles`);

    // Step 4: Enrich with OG images (skip if we're running low on time)
    const elapsedSoFar = Date.now() - startTime;
    let withImages = curated.filter((s) => s.image_url).length;
    let enriched = curated;

    if (elapsedSoFar < 45000) {
      log.push(`Scraping OG images (${Math.round(elapsedSoFar / 1000)}s elapsed, budget ok)...`);
      enriched = await enrichWithOgImages(curated);
      withImages = enriched.filter((s) => s.image_url).length;
      log.push(`OG enrichment: ${withImages}/${enriched.length} stories now have images`);
    } else {
      log.push(`Skipping OG scraping — ${Math.round(elapsedSoFar / 1000)}s elapsed, preserving time budget`);
    }

    // Step 5: Upsert into database
    const inserted = await upsertStories(enriched);
    log.push(`Upserted ${inserted} stories into DB`);

    // Step 6: Archive old stories
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
        withImages,
        inserted,
        archived,
        totalActive,
        elapsed: `${elapsed}ms`,
      },
      diagnostics: getLastDiagnostics(),
      batchErrors: getBatchErrors(),
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
