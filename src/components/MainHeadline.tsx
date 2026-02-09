import { CuratedStory } from "@/lib/types";

interface Props {
  story: CuratedStory | null;
}

export default function MainHeadline({ story }: Props) {
  if (!story) {
    return (
      <section className="py-8 text-center">
        <p className="text-warm-brown/50 font-serif text-xl italic">
          Curating today&apos;s gold...
        </p>
      </section>
    );
  }

  return (
    <section className="py-8 px-4 text-center border-b-2 border-gold/30">
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="headline-link"
      >
        {story.title}
      </a>
      {story.summary && (
        <p className="mt-3 text-warm-brown/70 font-serif text-base md:text-lg max-w-2xl mx-auto">
          {story.summary}
        </p>
      )}
      {story.source && (
        <p className="mt-2 text-xs text-warm-brown/40 uppercase tracking-wider">
          {story.source}
        </p>
      )}
    </section>
  );
}
