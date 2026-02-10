import Anthropic from "@anthropic-ai/sdk";
import { RawStory, ClaudeBatchResult, ClaudeFinalResult, StoryCategory, StoryTier } from "../types";

const client = new Anthropic();

/** Extract a JSON array from text that may have surrounding prose */
function extractJsonArray(text: string): string {
  // Strip markdown fences
  let cleaned = text.replace(/^```json?\s*/m, "").replace(/```\s*$/m, "").trim();

  // Find the outermost JSON array brackets
  const start = cleaned.indexOf("[");
  if (start === -1) return cleaned;

  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "[") depth++;
    if (cleaned[i] === "]") depth--;
    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  // If we didn't find a matching bracket, return from [ to the end
  return cleaned.slice(start);
}

const BATCH_SYSTEM_PROMPT = `You are the editor of Love Report — a global lens on the best of what humanity is becoming. This is not a feel-good site. This is evidence that the world is healing, that people are brave, that nature is resilient, and that the arc bends toward justice when people bend it.

Your editorial philosophy: find proof that life is winning.

WHAT YOU SEEK (in order of editorial priority):

1. HEROISM & COURAGE (highest priority — these are rare and precious)
   - Everyday people doing extraordinary things: a teenager swimming miles to save someone, a stranger pulling people from a wreck, a bystander stopping a crime
   - Rescuers who risk their own lives — firefighters, divers, mountain rescuers, ordinary citizens who become heroes in a moment
   - Whistleblowers, brave dissenters, people standing alone against corrupt systems and prevailing
   - Kids, elderly, disabled people — anyone — doing something physically or morally extraordinary
   - NOT military heroism or war stories — civilian courage, human spirit at its peak

2. JUSTICE & RESISTANCE
   - Human rights victories anywhere on Earth — courts, streets, legislatures
   - Political prisoners freed, authoritarian overreach defeated
   - Indigenous peoples winning land rights, sovereignty recognized
   - Workers organizing and winning against exploitation
   - Communities stopping pipelines, mines, land grabs
   - Anti-corruption victories, powerful held accountable

3. NATURE HEALING
   - Species pulled back from extinction, populations recovering
   - Ecosystems restored: rewilding, reforestation, coral recovery
   - Rivers cleaned, oceans healing, pollution reversed
   - Regenerative agriculture, permaculture, living with the land
   - Traditional ecological knowledge honored and applied
   - Wildlife corridors, marine sanctuaries, protected areas expanded

4. CIVILIZATION GETTING WISER
   - Peace agreements between long-warring peoples
   - Restorative justice replacing punitive systems
   - Truth and reconciliation processes bearing fruit
   - Reparations, land back, historical wrongs addressed
   - Education access expanded, especially for marginalized communities

5. SCIENCE & MEDICINE SERVING LIFE
   - Breakthroughs that will actually reach ordinary people (not just rich countries)
   - Cures, treatments, diagnostics — especially for neglected diseases
   - Clean energy milestones, but only the genuinely significant ones
   - Open-source science, knowledge shared freely

6. COMMUNITY & MUTUAL AID
   - People taking care of each other without waiting for institutions
   - Cooperatives, land trusts, community ownership
   - Refugee welcome, sanctuary, solidarity across borders
   - Intergenerational connection, elders honored, youth empowered

GLOBAL LENS: Prioritize stories from OUTSIDE the US/UK/Europe. Africa, Asia, Latin America, Pacific Islands, Indigenous nations everywhere — these stories are underrepresented and often the most powerful. A story about a village in Bangladesh solving its own water crisis is worth more than another US tech company announcement.

REJECT:
- Feel-good fluff ("dog reunited with owner", "strangers pay for meal")
- Corporate PR and greenwashing
- Clickbait with no lasting impact
- Disaster + silver lining framing
- Duplicate stories (pick the SINGLE best version)
- US-centric political partisan spin
- Celebrity charity unless the systemic impact is massive

IMPORTANCE SCORING (spread your scores — do NOT cluster everything at 7-8):
10 = Historic, civilization-level (peace deal ending decades of war, disease eradicated)
9 = Major global significance (landmark international court ruling, species declared recovered)
8 = Significant (national policy shift, major scientific breakthrough)
7 = Notable (regional victory, important legal precedent)
5-6 = Solid positive development
3-4 = Good but modest
1-2 = Minor but real

DIVERSITY GUIDANCE: Actively seek variety. No more than 3 stories on the same narrow topic (e.g. max 3 cancer stories). Favor global stories over US-only when quality is similar. But do NOT reject good stories just to fill a quota — if a batch is science-heavy, select the best science stories AND whatever else is good.

For each selected story, return a JSON array of objects with keys:
- index: The story number from the list (1-indexed)
- importance: 1-10 score
- category: one of: health | environment | science | justice | community | human-interest | innovation | culture | education | peace
- summary: One sentence on why this matters (max 15 words)

Select 15-25 stories per batch. Be generous — let good stories through. Return ONLY valid JSON.`;

const FINAL_SYSTEM_PROMPT = `You are the editor-in-chief of Love Report, styling headlines in the voice of the Drudge Report. Your job: assign tiers and rewrite every headline in dramatic, punchy Drudge style.

DRUDGE HEADLINE RULES:
- ALL CAPS always
- Use ellipses (...) liberally for drama and mystery
- Be editorial and opinionated, not neutral
- Short, punchy, provocative — make people CLICK
- Strip source attribution from headlines
- Add dramatic flair without lying
- Examples:
  "Scientists discover high-temp superconductor" → "SUPERCONDUCTOR BREAKTHROUGH STUNS PHYSICS WORLD..."
  "New treaty reduces ocean plastic" → "OCEAN PLASTIC SLASHED IN HISTORIC DEAL..."
  "Community raises $2M for school" → "SMALL TOWN RALLIES: $2M FOR KIDS..."

TIER ASSIGNMENT:
- banner (1 story): The single most important, dramatic story of the day
- top (3-5 stories): Major stories that deserve prominent centered placement
- above-fold (5-8 stories): Strong stories visible without scrolling
- column (bulk, 30-50 stories): The main body of content in 3 columns
- bottom-bar (5-10 stories): Lighter/quirky stories for the bottom strip

COLUMN ASSIGNMENT (for "column" tier only):
- left: science, health, innovation, education
- center: environment, peace, justice (the "hard news" center)
- right: community, human-interest, culture

Ensure category diversity — no single topic should dominate any tier.

For each story, return a JSON array of objects with keys:
- index: The story number from the input list (1-indexed)
- tier: one of: banner | top | above-fold | column | bottom-bar
- display_title: The Drudge-style rewritten headline in ALL CAPS
- column: "left" | "center" | "right" (only for column tier, omit for others)

Return ONLY valid JSON, no markdown fences or explanation.`;

// Track errors for diagnostics
const _batchErrors: string[] = [];
export function getBatchErrors(): string[] { return _batchErrors; }

async function runBatchCuration(
  stories: RawStory[],
  batchIndex: number
): Promise<{ story: RawStory; result: ClaudeBatchResult }[]> {
  if (!stories.length) return [];

  const headlines = stories
    .map((s, i) => `${i + 1}. "${s.title}" — [${s.source}]`)
    .join("\n");

  try {
    console.log(`[Claude] Batch ${batchIndex}: Sending ${stories.length} headlines...`);
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: BATCH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Batch ${batchIndex}: Select and rank the genuinely important positive stories:\n\n${headlines}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonStr = extractJsonArray(text);
    const results: ClaudeBatchResult[] = JSON.parse(jsonStr);
    const mapped: { story: RawStory; result: ClaudeBatchResult }[] = [];

    for (const item of results) {
      const idx = item.index - 1;
      if (idx < 0 || idx >= stories.length) continue;
      mapped.push({ story: stories[idx], result: item });
    }

    console.log(`[Claude] Batch ${batchIndex}: Selected ${mapped.length} stories`);
    return mapped;
  } catch (err) {
    const errMsg = `Batch ${batchIndex}: ${err instanceof Error ? err.message : String(err)}`;
    _batchErrors.push(errMsg);
    console.error(`[Claude] ${errMsg}`);
    return [];
  }
}

interface SurvivorStory {
  story: RawStory;
  importance: number;
  category: StoryCategory;
  summary: string;
}

async function runFinalRanking(
  survivors: SurvivorStory[]
): Promise<{ survivor: SurvivorStory; final: ClaudeFinalResult }[]> {
  if (!survivors.length) return [];

  const headlines = survivors
    .map((s, i) => `${i + 1}. "${s.story.title}" [importance: ${s.importance}, category: ${s.category}]`)
    .join("\n");

  try {
    console.log(`[Claude] Final pass: Ranking ${survivors.length} survivors...`);
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: FINAL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are today's ${survivors.length} curated stories. Assign tiers, rewrite headlines in Drudge style, and assign column placement:\n\n${headlines}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonStr = extractJsonArray(text);
    const results: ClaudeFinalResult[] = JSON.parse(jsonStr);
    const mapped: { survivor: SurvivorStory; final: ClaudeFinalResult }[] = [];

    for (const item of results) {
      const idx = item.index - 1;
      if (idx < 0 || idx >= survivors.length) continue;
      mapped.push({ survivor: survivors[idx], final: item });
    }

    console.log(`[Claude] Final pass: Assigned tiers to ${mapped.length} stories`);
    return mapped;
  } catch (err) {
    console.error("[Claude] Final ranking error:", err);
    return [];
  }
}

export interface MultiPassResult {
  title: string;
  display_title: string;
  url: string;
  source: string;
  image_url?: string;
  importance: number;
  category: StoryCategory;
  summary: string;
  tier: StoryTier;
  column?: "left" | "center" | "right";
  is_headline: boolean;
}

export interface CurationDiagnostics {
  batchSizes: number[];
  batchSurvivorCounts: number[];
  totalSurvivors: number;
  topSurvivorCount: number;
  finalBatchCounts: number[];
  finalOutputCount: number;
}

let _lastDiagnostics: CurationDiagnostics | null = null;
export function getLastDiagnostics(): CurationDiagnostics | null {
  return _lastDiagnostics;
}

export async function curateWithClaude(
  stories: RawStory[]
): Promise<MultiPassResult[]> {
  const diag: CurationDiagnostics = {
    batchSizes: [], batchSurvivorCounts: [], totalSurvivors: 0,
    topSurvivorCount: 0, finalBatchCounts: [], finalOutputCount: 0,
  };
  _lastDiagnostics = diag;

  if (!stories.length) {
    console.log("[Claude] No stories to curate");
    return [];
  }

  // Pass 1: Split into 4 batches and curate in parallel
  const batchSize = Math.ceil(stories.length / 4);
  const batches: RawStory[][] = [];
  for (let i = 0; i < stories.length; i += batchSize) {
    batches.push(stories.slice(i, i + batchSize));
  }

  diag.batchSizes = batches.map(b => b.length);
  _batchErrors.length = 0; // Reset errors
  console.log(`[Claude] Running ${batches.length} batch curation calls in 2 waves (${diag.batchSizes.join(', ')} stories each)...`);

  // Run batches in 2 waves of 2 to avoid rate limiting
  const allBatchResults: PromiseSettledResult<{ story: RawStory; result: ClaudeBatchResult }[]>[] = [];
  for (let wave = 0; wave < batches.length; wave += 2) {
    const waveBatches = batches.slice(wave, wave + 2);
    const waveResults = await Promise.allSettled(
      waveBatches.map((batch, i) => runBatchCuration(batch, wave + i + 1))
    );
    allBatchResults.push(...waveResults);
  }

  // Collect all survivors
  const survivors: SurvivorStory[] = [];
  for (let i = 0; i < allBatchResults.length; i++) {
    const result = allBatchResults[i];
    if (result.status === "fulfilled") {
      for (const { story, result: r } of result.value) {
        survivors.push({
          story,
          importance: r.importance,
          category: r.category as StoryCategory,
          summary: r.summary,
        });
      }
      diag.batchSurvivorCounts.push(result.value.length);
      console.log(`[Claude] Batch ${i + 1}: ${result.value.length} survivors`);
    } else {
      diag.batchSurvivorCounts.push(-1);
      console.error(`[Claude] Batch ${i + 1} FAILED:`, result.reason);
    }
  }

  diag.totalSurvivors = survivors.length;
  console.log(`[Claude] Total survivors from batch curation: ${survivors.length}`);

  if (!survivors.length) return [];

  // Sort by importance and cap at 80
  survivors.sort((a, b) => b.importance - a.importance);
  const topSurvivors = survivors.slice(0, 80);
  diag.topSurvivorCount = topSurvivors.length;

  // Pass 2: Final ranking and headline rewrite — split into 2 parallel calls to stay under token limits
  const midpoint = Math.ceil(topSurvivors.length / 2);
  const finalBatches = [
    topSurvivors.slice(0, midpoint),
    topSurvivors.slice(midpoint),
  ].filter((b) => b.length > 0);

  console.log(`[Claude] Running ${finalBatches.length} parallel final ranking calls...`);
  const finalBatchResults = await Promise.allSettled(
    finalBatches.map((batch) => runFinalRanking(batch))
  );

  const finalResults: { survivor: SurvivorStory; final: ClaudeFinalResult }[] = [];
  for (let i = 0; i < finalBatchResults.length; i++) {
    const result = finalBatchResults[i];
    if (result.status === "fulfilled") {
      diag.finalBatchCounts.push(result.value.length);
      console.log(`[Claude] Final batch ${i + 1}: ${result.value.length} stories tiered`);
      finalResults.push(...result.value);
    } else {
      diag.finalBatchCounts.push(-1);
      console.error(`[Claude] Final batch ${i + 1} FAILED:`, result.reason);
    }
  }

  // Build final output
  const output: MultiPassResult[] = [];
  for (const { survivor, final: f } of finalResults) {
    output.push({
      title: survivor.story.title,
      display_title: f.display_title,
      url: survivor.story.url,
      source: survivor.story.source,
      image_url: survivor.story.image_url,
      importance: survivor.importance,
      category: survivor.category,
      summary: survivor.summary,
      tier: f.tier as StoryTier,
      column: f.column as "left" | "center" | "right" | undefined,
      is_headline: f.tier === "banner",
    });
  }

  diag.finalOutputCount = output.length;
  console.log(`[Claude] Multi-pass complete: ${output.length} stories curated`);
  return output;
}
