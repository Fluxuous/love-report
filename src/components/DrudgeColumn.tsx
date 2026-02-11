import { StoryGroup } from "@/lib/types";
import { isBadImageUrl } from "@/lib/images";
import ScoreBadge from "./ScoreBadge";

export default function DrudgeColumn({ groups }: { groups: StoryGroup[] }) {
  if (!groups.length) return null;

  const allStories = groups.flatMap((g) => g.stories);
  const imageIds = new Set<string>();
  let imageCount = 0;
  for (const story of allStories) {
    if (imageCount >= 2) break;
    if (story.image_url && !isBadImageUrl(story.image_url)) {
      imageIds.add(story.id);
      imageCount++;
    }
  }

  return (
    <>
      {groups.map((group, gi) => (
        <div key={group.dimensionKey || gi}>
          {gi > 0 && <hr />}
          {group.stories.map((story) => {
            const title = story.display_title || story.title.toUpperCase();
            const score = story.highest_good ?? story.importance;
            const isHighImportance = score >= 8.5;
            const isItalic = score < 4.0;
            const showImage = imageIds.has(story.id);

            const className = [
              isHighImportance ? "red" : "",
              isItalic ? "italic" : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined;

            return (
              <div key={story.id} className="story-row">
                {showImage && story.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={story.image_url} alt="" />
                )}
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {title}
                </a>
                <ScoreBadge
                  scores={story.ai_scores}
                  highestGood={story.highest_good}
                  summary={story.summary}
                />
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
