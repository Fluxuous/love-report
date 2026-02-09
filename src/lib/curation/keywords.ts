import { RawStory } from "../types";

const POSITIVE_KEYWORDS = [
  "breakthrough",
  "saved",
  "victory",
  "record",
  "milestone",
  "rescued",
  "community",
  "innovation",
  "recovery",
  "hope",
  "progress",
  "achieve",
  "discover",
  "cure",
  "volunteer",
  "kindness",
  "hero",
  "triumph",
  "inspire",
  "transform",
  "solve",
  "restore",
  "protect",
  "celebrate",
  "succeed",
  "improve",
  "advance",
  "generous",
  "compassion",
  "remarkable",
];

const NEGATIVE_KEYWORDS = [
  "killed",
  "dead",
  "dies",
  "death",
  "murder",
  "crash",
  "disaster",
  "destroyed",
  "attack",
  "shooting",
  "bomb",
  "explosion",
  "war",
  "terror",
  "scandal",
  "fraud",
  "arrest",
  "charged",
  "guilty",
  "victim",
  "catastrophe",
  "collapse",
  "crisis",
  "famine",
  "drought",
  "recession",
];

/** Score a headline by positive/negative keyword presence */
function scoreHeadline(title: string): number {
  const lower = title.toLowerCase();
  let score = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) score += 1;
  }

  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) score -= 2;
  }

  return score;
}

/**
 * Pre-filter stories by keyword heuristics before sending to Claude.
 * Removes obvious negatives and ranks by positive keyword density.
 * Returns top N candidates to reduce API token usage.
 */
export function keywordPreFilter(
  stories: RawStory[],
  maxCandidates: number = 100
): RawStory[] {
  const scored = stories
    .map((story) => ({
      story,
      score: scoreHeadline(story.title),
    }))
    .filter((s) => s.score >= -1) // Allow neutral stories, reject strongly negative
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCandidates);

  console.log(
    `[Keywords] Filtered ${stories.length} → ${scored.length} candidates`
  );
  return scored.map((s) => s.story);
}
