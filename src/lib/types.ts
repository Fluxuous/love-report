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
}

export interface ClaudeBatchResult {
  index: number;
  importance: number;
  category: StoryCategory;
  summary: string;
}

export interface ClaudeFinalResult {
  index: number;
  tier: StoryTier;
  display_title: string;
  column?: "left" | "center" | "right";
}

export interface DrudgeLayout {
  banner: CuratedStory | null;
  top: CuratedStory[];
  aboveFold: CuratedStory[];
  columns: {
    left: CuratedStory[];
    center: CuratedStory[];
    right: CuratedStory[];
  };
  bottomBar: CuratedStory[];
}
