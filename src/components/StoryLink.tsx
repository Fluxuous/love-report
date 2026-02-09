import { CuratedStory } from "@/lib/types";

interface Props {
  story: CuratedStory;
}

export default function StoryLink({ story }: Props) {
  return (
    <li className="story-bullet py-1.5">
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="story-link"
      >
        {story.title}
      </a>
    </li>
  );
}
