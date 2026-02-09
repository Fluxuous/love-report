export interface RawStory {
  title: string;
  url: string;
  source: string;
  image_url?: string;
  published_at?: string;
}

export interface CuratedStory {
  id: string;
  title: string;
  url: string;
  source: string;
  category: StoryCategory;
  importance: number;
  summary: string;
  image_url?: string;
  published_at: string;
  curated_at: string;
  is_headline: boolean;
  is_active: boolean;
}

export type StoryCategory =
  | "health"
  | "environment"
  | "science"
  | "justice"
  | "community"
  | "human-interest"
  | "innovation";

export interface ClaudeCurationResult {
  title: string;
  url: string;
  importance: number;
  category: StoryCategory;
  summary: string;
  is_headline: boolean;
}

/** Columns grouped for the 3-column layout */
export interface ColumnGroup {
  headline: CuratedStory | null;
  scienceHealth: CuratedStory[];
  communityHuman: CuratedStory[];
  justiceEnvironment: CuratedStory[];
  innovation: CuratedStory[];
}
