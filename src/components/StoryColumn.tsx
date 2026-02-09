import { CuratedStory } from "@/lib/types";
import StoryLink from "./StoryLink";

interface Props {
  title: string;
  stories: CuratedStory[];
}

export default function StoryColumn({ title, stories }: Props) {
  if (stories.length === 0) return null;

  return (
    <div className="px-3">
      <h2 className="category-header">{title}</h2>
      <ul className="space-y-0.5">
        {stories.map((story) => (
          <StoryLink key={story.id} story={story} />
        ))}
      </ul>
    </div>
  );
}
