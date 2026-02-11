import { EthicalScores } from "../types";

export type DimensionKey = keyof EthicalScores;

export interface DimensionMeta {
  key: DimensionKey;
  name: string;
  emoji: string;
  color: string;
  question: string;
  philosophicalRoot: string;
}

export const DIMENSION_META: DimensionMeta[] = [
  {
    key: "courage",
    name: "Courage",
    emoji: "\u{1F981}",
    color: "#c0392b",
    question: "What did it cost?",
    philosophicalRoot: "Andreia",
  },
  {
    key: "impact",
    name: "Impact",
    emoji: "\u{1F30D}",
    color: "#d4a017",
    question: "How much total good was created?",
    philosophicalRoot: "Maslaha",
  },
  {
    key: "justice",
    name: "Justice",
    emoji: "\u2696\uFE0F",
    color: "#8e44ad",
    question: "Does this shift power toward the powerless?",
    philosophicalRoot: "Tzedek",
  },
  {
    key: "compassion",
    name: "Compassion",
    emoji: "\u{1F49A}",
    color: "#27ae60",
    question: "Was this rooted in genuine care for the suffering of others?",
    philosophicalRoot: "Karuna",
  },
  {
    key: "harmony",
    name: "Harmony",
    emoji: "\u{1F30A}",
    color: "#2980b9",
    question: "Does this serve the web of life?",
    philosophicalRoot: "Wu Wei",
  },
  {
    key: "grace",
    name: "Grace",
    emoji: "\u{1F54A}\uFE0F",
    color: "#e84393",
    question: "Was good extended across a divide?",
    philosophicalRoot: "Charis",
  },
  {
    key: "truth",
    name: "Truth",
    emoji: "\u{1F525}",
    color: "#e67e22",
    question: "Did this make hidden reality visible?",
    philosophicalRoot: "Satya / Maat",
  },
  {
    key: "transcendence",
    name: "Transcendence",
    emoji: "\u2728",
    color: "#95a5a6",
    question: "Does this exceed what self-interest can explain?",
    philosophicalRoot: "Nishkama Karma",
  },
];

export const DEFAULT_WEIGHTS: Record<DimensionKey, number> = {
  courage: 0.15,
  impact: 0.10,
  justice: 0.15,
  compassion: 0.10,
  harmony: 0.10,
  grace: 0.15,
  truth: 0.15,
  transcendence: 0.10,
};

export function computeHighestGood(
  scores: EthicalScores,
  weights: Record<DimensionKey, number> = DEFAULT_WEIGHTS
): number {
  let sum = 0;
  for (const dim of DIMENSION_META) {
    sum += (scores[dim.key] || 0) * (weights[dim.key] || 0);
  }
  return Math.round(sum * 10) / 10;
}

/** Map a 0-10 float composite to a 1-10 integer for backward compat with tier thresholds */
export function highestGoodToImportance(hg: number): number {
  return Math.max(1, Math.min(10, Math.round(hg)));
}

/** Find the dimension with the highest individual score */
export function getDominantDimension(scores: EthicalScores): DimensionKey {
  let maxKey: DimensionKey = "courage";
  let maxVal = -1;
  for (const dim of DIMENSION_META) {
    const val = scores[dim.key] || 0;
    if (val > maxVal) {
      maxVal = val;
      maxKey = dim.key;
    }
  }
  return maxKey;
}

/**
 * Map dimensions to 3 thematic columns:
 * - Left: Courage, Justice, Truth (the moral fire — bravery, accountability, truth-telling)
 * - Center: Impact, Harmony, Transcendence (the big picture — scale, ecology, selflessness)
 * - Right: Compassion, Grace (the human heart — warmth, forgiveness, crossing divides)
 */
const DIMENSION_COLUMN: Record<DimensionKey, "left" | "center" | "right"> = {
  courage: "left",
  justice: "left",
  truth: "left",
  impact: "center",
  harmony: "center",
  transcendence: "center",
  compassion: "right",
  grace: "right",
};

export function getDimensionColumn(scores: EthicalScores): "left" | "center" | "right" {
  return DIMENSION_COLUMN[getDominantDimension(scores)];
}
