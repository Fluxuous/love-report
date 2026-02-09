import { NextResponse } from "next/server";
import { getActiveStories } from "@/lib/db";
import { ColumnGroup, CuratedStory } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function groupStories(stories: CuratedStory[]): ColumnGroup {
  const headline = stories.find((s) => s.is_headline) || stories[0] || null;
  const rest = stories.filter((s) => s !== headline);

  const scienceHealth = rest.filter(
    (s) => s.category === "science" || s.category === "health"
  );
  const communityHuman = rest.filter(
    (s) => s.category === "community" || s.category === "human-interest"
  );
  const justiceEnvironment = rest.filter(
    (s) => s.category === "justice" || s.category === "environment"
  );
  const innovation = rest.filter((s) => s.category === "innovation");

  // Distribute uncategorized stories to shortest column
  const categorized = new Set([
    ...scienceHealth,
    ...communityHuman,
    ...justiceEnvironment,
    ...innovation,
  ]);

  const uncategorized = rest.filter((s) => !categorized.has(s));
  const columns = [scienceHealth, communityHuman, justiceEnvironment];

  for (const story of uncategorized) {
    const shortest = columns.reduce((a, b) =>
      a.length <= b.length ? a : b
    );
    shortest.push(story);
  }

  return { headline, scienceHealth, communityHuman, justiceEnvironment, innovation };
}

export async function GET() {
  try {
    const stories = await getActiveStories();
    const grouped = groupStories(stories);

    return NextResponse.json({
      stories: grouped,
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
