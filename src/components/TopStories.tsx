import { CuratedStory } from "@/lib/types";
import { isBadImageUrl } from "@/lib/images";

export default function TopStories({ stories }: { stories: CuratedStory[] }) {
  if (!stories.length) return null;

  // First story with a real image gets the image shown
  const imageStory = stories.find((s) => s.image_url && !isBadImageUrl(s.image_url));

  return (
    <div className="lr-top-section">
      {imageStory?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageStory.image_url} alt="" />
      )}
      {stories.map((story) => {
        const title = story.display_title || story.title.toUpperCase();
        const isHighImportance = story.importance >= 9;
        return (
          <a
            key={story.id}
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className={isHighImportance ? "red" : undefined}
          >
            {title}
          </a>
        );
      })}
    </div>
  );
}
