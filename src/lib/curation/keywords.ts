import { RawStory } from "../types";

const POSITIVE_KEYWORDS = [
  // Original
  "breakthrough",
  "saved",
  "victory",
  "milestone",
  "rescued",
  "innovation",
  "recovery",
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
  "succeed",
  "advance",
  "generous",
  "compassion",
  // Nature & healing
  "rewild",
  "reforest",
  "regenerat",
  "ecosystem",
  "coral",
  "permaculture",
  "indigenous",
  "sacred",
  // Human rights & resistance
  "freed",
  "acquit",
  "overturn",
  "rights",
  "justice",
  "union",
  "cooperat",
  "mutual aid",
  "sovereignty",
  "whistleblow",
  "accountability",
  "reparation",
  "reconcil",
  // Heroism & courage
  "heroic",
  "bystander",
  "good samaritan",
  "survived",
  "miracle",
  "daring",
  "selfless",
  "bravery",
  "life-saving",
  "lifesaving",
  "defied",
  "stood up",
  "risked",
  "despite threats",
  "pulled from",
  "rushed into",
  // Spirit & resilience
  "resilien",
  "solidarity",
  "liberat",
  "empower",
  "dignity",
  "healing",
  // Peace & civilization
  "peace",
  "treaty",
  "ceasefire",
  "amnesty",
  "pardon",
  "diplomatic",
  "landmark ruling",
  "historic vote",
  "bipartisan",
  "unanimous",
  // Science & medicine
  "vaccine",
  "clinical trial",
  "open source",
  "treatment",
  "therapy",
  "diagnostic",
  "gene therapy",
  "fda approved",
  // Innovation access
  "patent-free",
  "affordable",
  "low-cost",
  "accessible",
];

// Hard negatives: always strongly negative signal
const HARD_NEGATIVE_KEYWORDS = [
  "killed",
  "dead",
  "dies",
  "death",
  "murder",
  "crash",
  "disaster",
  "destroyed",
  "shooting",
  "bomb",
  "explosion",
  "terror",
  "catastrophe",
  "famine",
  "drought",
  "recession",
];

// Soft negatives: ambiguous — could be accountability wins or peace stories
// "CEO Arrested for Fraud" = accountability win, "War Ends" = peace story
const SOFT_NEGATIVE_KEYWORDS = [
  "attack",
  "war",
  "scandal",
  "fraud",
  "arrest",
  "charged",
  "guilty",
  "victim",
  "collapse",
  "crisis",
];

/** Score a headline by positive/negative keyword presence */
function scoreHeadline(title: string): number {
  const lower = title.toLowerCase();
  let score = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) score += 1;
  }

  for (const kw of HARD_NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) score -= 2;
  }

  for (const kw of SOFT_NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) score -= 1;
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
  maxCandidates: number = 200
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
