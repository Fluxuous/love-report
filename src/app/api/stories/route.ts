import { NextResponse } from "next/server";
import { getActiveStories } from "@/lib/db";
import { DrudgeLayout, CuratedStory, StoryGroup } from "@/lib/types";
import { getDominantDimension, getDimensionColumn } from "@/lib/curation/scoring";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_COLUMN: Record<string, "left" | "center" | "right"> = {
  science: "left", health: "left", innovation: "left", education: "left",
  environment: "center", peace: "center", justice: "center",
  community: "right", "human-interest": "right", culture: "right",
};

function getScore(s: CuratedStory): number {
  return s.highest_good ?? s.importance;
}

function buildGroups(stories: CuratedStory[]): StoryGroup[] {
  const byDim = new Map<string, CuratedStory[]>();
  for (const story of stories) {
    const key = story.ai_scores
      ? getDominantDimension(story.ai_scores)
      : `cat:${story.category}`;
    if (!byDim.has(key)) byDim.set(key, []);
    byDim.get(key)!.push(story);
  }
  Array.from(byDim.values()).forEach((group) => {
    group.sort((a, b) => getScore(b) - getScore(a));
  });
  return Array.from(byDim.entries())
    .sort((a, b) => getScore(b[1][0]) - getScore(a[1][0]))
    .map(([dimKey, stories]) => ({ dimensionKey: dimKey, stories }));
}

function layoutStories(stories: CuratedStory[]): DrudgeLayout {
  const banner = stories.find((s) => s.tier === "banner" || s.is_headline) || null;
  const rest = stories.filter((s) => s !== banner);

  const sorted = [...rest].sort((a, b) => getScore(b) - getScore(a));
  const top = sorted.slice(0, 8);
  const remaining = sorted.slice(8);

  const colStories: Record<"left" | "center" | "right", CuratedStory[]> = {
    left: [], center: [], right: [],
  };

  for (const story of remaining) {
    const col = story.ai_scores
      ? getDimensionColumn(story.ai_scores)
      : (CATEGORY_COLUMN[story.category] || "center");
    colStories[col].push(story);
  }

  return {
    banner,
    top,
    aboveFold: [],
    columns: {
      left: buildGroups(colStories.left),
      center: buildGroups(colStories.center),
      right: buildGroups(colStories.right),
    },
    bottomBar: [],
  };
}

export async function GET() {
  try {
    const stories = await getActiveStories();
    const layout = layoutStories(stories);

    return NextResponse.json({
      layout,
      total: stories.length,
      lastUpdated: stories[0]?.curated_at || null,
    });
  } catch (err) {
    console.error("[API] Error fetching stories:", err);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
