import { CuratedStory, EthicalScores } from "./types";
import { getActiveStories } from "./db";
import {
  DIMENSION_META,
  DimensionKey,
  DimensionMeta,
} from "./curation/scoring";
import Anthropic from "@anthropic-ai/sdk";

// --- Tension pairs: dimensions that genuinely conflict ---

const TENSION_PAIRS: [DimensionKey, DimensionKey, string][] = [
  ["grace", "justice", "Forgiveness vs Accountability"],
  ["truth", "compassion", "Honesty vs Gentleness"],
  ["courage", "harmony", "Disruption vs Stability"],
  ["impact", "transcendence", "Scale vs Selflessness"],
];

export interface TensionOfTheDay {
  story: CuratedStory;
  highDim: DimensionMeta;
  lowDim: DimensionMeta;
  pairLabel: string;
  note: string; // Claude-generated explanation
}

export interface DimensionSpotlight {
  dimension: DimensionMeta;
  story: CuratedStory;
  score: number;
}

export interface NewsletterContent {
  date: string;
  banner: CuratedStory;
  topStories: CuratedStory[];
  tension: TensionOfTheDay | null;
  spotlight: DimensionSpotlight;
}

// --- Story selection with category diversity ---

function selectTopStories(
  stories: CuratedStory[],
  count: number,
  exclude: Set<string>
): CuratedStory[] {
  const sorted = stories
    .filter((s) => !exclude.has(s.id))
    .sort((a, b) => (b.highest_good ?? b.importance) - (a.highest_good ?? a.importance));

  const selected: CuratedStory[] = [];
  const categoryCounts = new Map<string, number>();

  for (const story of sorted) {
    if (selected.length >= count) break;
    const catCount = categoryCounts.get(story.category) || 0;
    // Allow max 2 stories from same category to ensure diversity
    if (catCount >= 2) continue;
    selected.push(story);
    categoryCounts.set(story.category, catCount + 1);
  }

  return selected;
}

// --- Tension detection ---

function findTension(stories: CuratedStory[]): {
  story: CuratedStory;
  highDim: DimensionMeta;
  lowDim: DimensionMeta;
  pairLabel: string;
  tensionScore: number;
} | null {
  let best: {
    story: CuratedStory;
    highDim: DimensionMeta;
    lowDim: DimensionMeta;
    pairLabel: string;
    tensionScore: number;
  } | null = null;

  for (const story of stories) {
    if (!story.ai_scores) continue;
    const scores = story.ai_scores;

    // Check named tension pairs: both dimensions must be meaningful (>= 4.0)
    // and the tension score is the minimum of the pair (both must be high for real tension)
    for (const [dimA, dimB, label] of TENSION_PAIRS) {
      const a = scores[dimA];
      const b = scores[dimB];
      if (a >= 4.0 && b >= 4.0) {
        // Tension is stronger when both dimensions are high
        const tensionScore = Math.min(a, b) + Math.abs(a - b) * 0.3;
        if (!best || tensionScore > best.tensionScore) {
          const metaA = DIMENSION_META.find((d) => d.key === dimA)!;
          const metaB = DIMENSION_META.find((d) => d.key === dimB)!;
          // Put the higher one first
          best = {
            story,
            highDim: a >= b ? metaA : metaB,
            lowDim: a >= b ? metaB : metaA,
            pairLabel: label,
            tensionScore,
          };
        }
      }
    }

    // Also check raw spread: max - min dimension with a high max
    const vals = Object.values(scores) as number[];
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max >= 6.0 && max - min >= 5.0) {
      const spread = max - min;
      if (!best || spread > best.tensionScore) {
        const maxKey = (Object.entries(scores) as [DimensionKey, number][])
          .sort((a, b) => b[1] - a[1])[0][0];
        const minKey = (Object.entries(scores) as [DimensionKey, number][])
          .sort((a, b) => a[1] - b[1])[0][0];
        best = {
          story,
          highDim: DIMENSION_META.find((d) => d.key === maxKey)!,
          lowDim: DIMENSION_META.find((d) => d.key === minKey)!,
          pairLabel: `${DIMENSION_META.find((d) => d.key === maxKey)!.name} vs ${DIMENSION_META.find((d) => d.key === minKey)!.name}`,
          tensionScore: spread,
        };
      }
    }
  }

  return best;
}

// --- Claude tension note generation ---

async function generateTensionNote(
  story: CuratedStory,
  highDim: DimensionMeta,
  lowDim: DimensionMeta,
  pairLabel: string
): Promise<string> {
  try {
    const client = new Anthropic();
    const scores = story.ai_scores!;
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `You write for Love Report, a positive news aggregator that scores stories on 8 ethical dimensions.

Story: "${story.display_title}"
Summary: ${story.summary}
Source: ${story.source}

This story shows a tension between ${highDim.name} (${scores[highDim.key].toFixed(1)}) and ${lowDim.name} (${scores[lowDim.key].toFixed(1)}).
Tension: ${pairLabel}

${highDim.name}: "${highDim.question}"
${lowDim.name}: "${lowDim.question}"

Write 1-2 sentences (max 40 words) explaining this ethical tension. Be specific to this story. Don't use the word "tension." Don't moralize — observe.`,
        },
      ],
    });
    const text = response.content[0];
    if (text.type === "text") return text.text.trim();
    return "";
  } catch (err) {
    console.error("[Newsletter] Failed to generate tension note:", err);
    return "";
  }
}

// --- Dimension spotlight (rotating) ---

function pickSpotlight(
  stories: CuratedStory[],
  exclude: Set<string>
): DimensionSpotlight {
  // Rotate through dimensions by day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const dimIndex = dayOfYear % DIMENSION_META.length;
  const dimension = DIMENSION_META[dimIndex];

  // Find the story with the highest score on this dimension
  const candidates = stories
    .filter((s) => s.ai_scores && !exclude.has(s.id))
    .sort(
      (a, b) =>
        (b.ai_scores![dimension.key] || 0) -
        (a.ai_scores![dimension.key] || 0)
    );

  const story = candidates[0] || stories[0];
  const score = story.ai_scores?.[dimension.key] || 0;

  return { dimension, story, score };
}

// --- Main generation ---

export async function generateNewsletter(): Promise<NewsletterContent | null> {
  const stories = await getActiveStories();
  if (stories.length < 3) {
    console.log("[Newsletter] Not enough stories to generate newsletter");
    return null;
  }

  // 1. Banner: highest-scoring story
  const sorted = [...stories].sort(
    (a, b) => (b.highest_good ?? b.importance) - (a.highest_good ?? a.importance)
  );
  const banner = sorted[0];
  const exclude = new Set([banner.id]);

  // 2. Top stories (4 more, diverse categories)
  const topStories = selectTopStories(stories, 4, exclude);
  topStories.forEach((s) => exclude.add(s.id));

  // 3. Tension of the Day
  let tension: TensionOfTheDay | null = null;
  const tensionCandidate = findTension(stories);
  if (tensionCandidate) {
    const note = await generateTensionNote(
      tensionCandidate.story,
      tensionCandidate.highDim,
      tensionCandidate.lowDim,
      tensionCandidate.pairLabel
    );
    tension = { ...tensionCandidate, note };
    exclude.add(tensionCandidate.story.id);
  }

  // 4. Dimension spotlight
  const spotlight = pickSpotlight(stories, exclude);

  return {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    banner,
    topStories,
    tension,
    spotlight,
  };
}
