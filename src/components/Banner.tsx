import { CuratedStory } from "@/lib/types";
import { isBadImageUrl } from "@/lib/images";

export default function Banner({ story }: { story: CuratedStory }) {
  const title = story.display_title || story.title.toUpperCase();
  const hasImage = story.image_url && !isBadImageUrl(story.image_url);

  return (
    <div className="lr-banner">
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.image_url} alt="" />
      )}
      <div className="lr-banner-headline">
        <a href={story.url} target="_blank" rel="noopener noreferrer">
          &apos;{title}&apos;
        </a>
      </div>
      <div className="lr-logo">
        <span className="lr-heart-left">&#10084;&#65039;</span>
        {" LOVE REPORT "}
        <span className="lr-heart-right">&#10084;&#65039;</span>
      </div>
    </div>
  );
}
