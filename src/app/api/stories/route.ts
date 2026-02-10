import { NextResponse } from "next/server";
import { getActiveStories } from "@/lib/db";
import { DrudgeLayout, CuratedStory } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function layoutStories(stories: CuratedStory[]): DrudgeLayout {
  const banner = stories.find((s) => s.tier === "banner" || s.is_headline) || null;
  const rest = stories.filter((s) => s !== banner);

  const sorted = [...rest].sort((a, b) => b.importance - a.importance);
  const top = sorted.slice(0, 8);
  const remaining = sorted.slice(8);

  const left: CuratedStory[] = [];
  const center: CuratedStory[] = [];
  const right: CuratedStory[] = [];
  const cols = [left, center, right];

  remaining.forEach((story, i) => {
    cols[i % 3].push(story);
  });

  return {
    banner,
    top,
    aboveFold: [],
    columns: { left, center, right },
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
