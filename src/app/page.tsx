import Header from "@/components/Header";
import MainHeadline from "@/components/MainHeadline";
import StoryColumn from "@/components/StoryColumn";
import Footer from "@/components/Footer";
import { getActiveStories } from "@/lib/db";
import { CuratedStory, ColumnGroup } from "@/lib/types";

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

  // Distribute uncategorized to shortest column
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

export default async function HomePage() {
  const stories = await getActiveStories();
  const { headline, scienceHealth, communityHuman, justiceEnvironment, innovation } =
    groupStories(stories);

  const hasStories = stories.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <Header />

      <MainHeadline story={headline} />

      {hasStories ? (
        <>
          {/* Three-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-6">
            <div className="md:pr-2">
              <StoryColumn title="Science & Health" stories={scienceHealth} />
            </div>
            <div className="md:border-x md:border-warm-brown/20 md:px-2">
              <StoryColumn
                title="Community & Human Interest"
                stories={communityHuman}
              />
            </div>
            <div className="md:pl-2">
              <StoryColumn
                title="Justice & Environment"
                stories={justiceEnvironment}
              />
            </div>
          </div>

          {/* Innovation bar */}
          {innovation.length > 0 && (
            <div className="mt-6 border-t-2 border-gold/30 pt-4">
              <StoryColumn
                title="Innovation & Breakthroughs"
                stories={innovation}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="font-serif text-xl text-warm-brown/50 italic">
            No stories yet. Run the curation pipeline to get started.
          </p>
          <p className="mt-4 text-sm text-warm-brown/40">
            Hit{" "}
            <code className="bg-warm-brown/10 px-2 py-1 rounded">
              /api/cron/curate
            </code>{" "}
            to trigger the first curation run.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
