import { CuratedStory } from "@/lib/types";
import { isBadImageUrl } from "@/lib/images";
import { toTitleCase } from "@/lib/format";
import ScoreBadge from "./ScoreBadge";

export default function TopStories({ stories }: { stories: CuratedStory[] }) {
  if (!stories.length) return null;

  const imageStory = stories.find((s) => s.image_url && !isBadImageUrl(s.image_url));

  return (
    <div className="lr-top-section">
      {imageStory?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageStory.image_url} alt="" />
      )}
      {stories.map((story) => {
        const title = toTitleCase(story.display_title || story.title);
        const score = story.highest_good ?? story.importance;
        const isHighImportance = score >= 8.5;
        return (
          <span key={story.id} className="story-row" style={{ display: "block" }}>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className={isHighImportance ? "red" : undefined}
            >
              {title}
            </a>
            <ScoreBadge
              scores={story.ai_scores}
              highestGood={story.highest_good}
              summary={story.summary}
            />
          </span>
        );
      })}
    </div>
  );
}
