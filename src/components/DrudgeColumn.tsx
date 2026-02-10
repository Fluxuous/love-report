import { CuratedStory } from "@/lib/types";
import { isBadImageUrl } from "@/lib/images";

export default function DrudgeColumn({ stories }: { stories: CuratedStory[] }) {
  if (!stories.length) return null;

  // Pick a couple stories to show images for (first ones that have real images)
  const imageIndices = new Set<number>();
  let imageCount = 0;
  for (let i = 0; i < stories.length && imageCount < 2; i++) {
    if (stories[i].image_url && !isBadImageUrl(stories[i].image_url)) {
      imageIndices.add(i);
      imageCount++;
    }
  }

  return (
    <>
      {stories.map((story, i) => {
        const title = story.display_title || story.title.toUpperCase();
        const isHighImportance = story.importance >= 9;
        const isItalic = story.importance <= 3;
        const showImage = imageIndices.has(i);

        const className = [
          isHighImportance ? "red" : "",
          isItalic ? "italic" : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined;

        return (
          <div key={story.id}>
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
          </div>
        );
      })}
    </>
  );
}
