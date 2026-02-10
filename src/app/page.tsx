import Banner from "@/components/Banner";
import TopStories from "@/components/TopStories";
import DrudgeColumn from "@/components/DrudgeColumn";
import Footer from "@/components/Footer";
import { getActiveStories } from "@/lib/db";
import { CuratedStory, DrudgeLayout } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function layoutStories(stories: CuratedStory[]): DrudgeLayout {
  const banner = stories.find((s) => s.tier === "banner" || s.is_headline) || null;
  const rest = stories.filter((s) => s !== banner);

  // Top stories: the highest importance ones after banner
  const sorted = [...rest].sort((a, b) => b.importance - a.importance);
  const top = sorted.slice(0, 8);
  const remaining = sorted.slice(8);

  // Round-robin distribute into 3 columns — no category grouping
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
              <DrudgeColumn stories={layout.columns.left} />
            </div>
            <div className="lr-col">
              <DrudgeColumn stories={layout.columns.center} />
            </div>
            <div className="lr-col">
              <DrudgeColumn stories={layout.columns.right} />
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
