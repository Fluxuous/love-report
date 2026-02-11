import Banner from "@/components/Banner";
import TopStories from "@/components/TopStories";
import DrudgeColumn from "@/components/DrudgeColumn";
import Footer from "@/components/Footer";
import { getActiveStories } from "@/lib/db";
import { CuratedStory, DrudgeLayout, StoryGroup } from "@/lib/types";
import { getDominantDimension, getDimensionColumn } from "@/lib/curation/scoring";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Category-based column fallback for stories without ethical scores */
const CATEGORY_COLUMN: Record<string, "left" | "center" | "right"> = {
  science: "left",
  health: "left",
  innovation: "left",
  education: "left",
  environment: "center",
  peace: "center",
  justice: "center",
  community: "right",
  "human-interest": "right",
  culture: "right",
};

function getScore(s: CuratedStory): number {
  return s.highest_good ?? s.importance;
}

function layoutStories(stories: CuratedStory[]): DrudgeLayout {
  const banner = stories.find((s) => s.tier === "banner" || s.is_headline) || null;
  const rest = stories.filter((s) => s !== banner);

  // Top stories: the highest scoring ones after banner
  const sorted = [...rest].sort((a, b) => getScore(b) - getScore(a));
  const top = sorted.slice(0, 8);
  const remaining = sorted.slice(8);

  // Assign stories to columns by dominant ethical dimension
  const colStories: Record<"left" | "center" | "right", CuratedStory[]> = {
    left: [],
    center: [],
    right: [],
  };

  for (const story of remaining) {
    let col: "left" | "center" | "right";
    if (story.ai_scores) {
      col = getDimensionColumn(story.ai_scores);
    } else {
      col = CATEGORY_COLUMN[story.category] || "center";
    }
    colStories[col].push(story);
  }

  // Rebalance: if any column has >50% more than average, redistribute lowest-scored overflow
  const total = remaining.length;
  const avg = Math.ceil(total / 3);
  const maxPerCol = Math.ceil(avg * 1.4); // Allow 40% variance

  for (const col of ["left", "center", "right"] as const) {
    while (colStories[col].length > maxPerCol) {
      // Find the smallest column to receive overflow
      const smallest = (["left", "center", "right"] as const)
        .filter((c) => c !== col)
        .sort((a, b) => colStories[a].length - colStories[b].length)[0];

      // Move the lowest-scored story from overloaded column
      const moved = colStories[col].pop()!; // already sorted by score desc, so pop = lowest
      colStories[smallest].push(moved);
    }
  }

  // Within each column: group stories by dominant dimension, sorted by score within each group
  function buildGroups(stories: CuratedStory[]): StoryGroup[] {
    const byDimension = new Map<string, CuratedStory[]>();

    for (const story of stories) {
      const dimKey = story.ai_scores
        ? getDominantDimension(story.ai_scores)
        : `cat:${story.category}`;
      if (!byDimension.has(dimKey)) byDimension.set(dimKey, []);
      byDimension.get(dimKey)!.push(story);
    }

    // Sort each group internally by score
    Array.from(byDimension.values()).forEach((group) => {
      group.sort((a, b) => getScore(b) - getScore(a));
    });

    // Order groups by their top story's score (best groups first)
    const groups = Array.from(byDimension.entries())
      .sort((a, b) => getScore(b[1][0]) - getScore(a[1][0]))
      .map(([dimKey, stories]) => ({
        dimensionKey: dimKey,
        stories,
      }));

    return groups;
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

export default async function HomePage() {
  const stories = await getActiveStories();
  const layout = layoutStories(stories);
  const hasStories = stories.length > 0;

  return (
    <>
      {hasStories ? (
        <>
          <TopStories stories={layout.top} />

          {layout.banner && <Banner story={layout.banner} />}

          <div className="lr-columns">
            <div className="lr-col">
              <DrudgeColumn groups={layout.columns.left} />
            </div>
            <div className="lr-col">
              <DrudgeColumn groups={layout.columns.center} />
            </div>
            <div className="lr-col">
              <DrudgeColumn groups={layout.columns.right} />
            </div>
          </div>
        </>
      ) : (
        <div className="lr-empty">
          <p>No stories yet.</p>
          <p style={{ marginTop: 8 }}>
            Hit <code>/api/cron/curate</code> to trigger the first curation run.
          </p>
        </div>
      )}

      <Footer />
    </>
  );
}
