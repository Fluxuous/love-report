export interface EthicalScores {
  courage: number;        // 0.0–10.0
  impact: number;         // 0.0–10.0
  justice: number;        // 0.0–10.0
  compassion: number;     // 0.0–10.0
  harmony: number;        // 0.0–10.0
  grace: number;          // 0.0–10.0
  truth: number;          // 0.0–10.0
  transcendence: number;  // 0.0–10.0
}

export interface RawStory {
  title: string;
  url: string;
  source: string;
  image_url?: string;
  published_at?: string;
}

export type StoryCategory =
  | "health"
  | "environment"
  | "science"
  | "justice"
  | "community"
  | "human-interest"
  | "innovation"
  | "culture"
  | "education"
  | "peace";

export type StoryTier =
  | "banner"
  | "top"
  | "above-fold"
  | "column"
  | "bottom-bar";

export interface CuratedStory {
  id: string;
  title: string;
  display_title: string;
  url: string;
  source: string;
  category: StoryCategory;
  importance: number;
  summary: string;
  tier: StoryTier;
  column?: "left" | "center" | "right";
  image_url?: string;
  published_at: string;
  curated_at: string;
  is_headline: boolean;
  is_active: boolean;
  ai_scores?: EthicalScores;
  highest_good?: number;
}

export interface ClaudeBatchResult {
  index: number;
  importance: number;
  category: StoryCategory;
  summary: string;
  scores?: EthicalScores;
}

export interface ClaudeFinalResult {
  index: number;
  tier: StoryTier;
  display_title: string;
  column?: "left" | "center" | "right";
}

/** A cluster of stories sharing a dominant ethical dimension within a column */
export interface StoryGroup {
  dimensionKey?: string;
  stories: CuratedStory[];
}

export interface DrudgeLayout {
  banner: CuratedStory | null;
  top: CuratedStory[];
  aboveFold: CuratedStory[];
  columns: {
    left: StoryGroup[];
    center: StoryGroup[];
    right: StoryGroup[];
  };
  bottomBar: CuratedStory[];
}
