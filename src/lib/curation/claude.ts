import Anthropic from "@anthropic-ai/sdk";
import { RawStory, ClaudeCurationResult } from "../types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the editor of Love Report, a Drudge Report-style news site that surfaces only positive, uplifting news. Your job: find the gold.

Given a list of headlines, select the ones that represent genuine positive developments:
- Scientific/medical breakthroughs
- Justice restored, wrongs righted
- Human achievement, kindness, mercy
- Environmental progress
- Community building, social improvement
- Innovation serving the public good
- Record-breaking positive achievements

REJECT stories that are:
- Disaster + silver lining ("hurricane destroys town but one dog survived")
- Corporate PR disguised as news
- Clickbait positivity with no substance
- Duplicate or near-duplicate stories
- Political partisan spin

For each selected story, provide:
- title: The original headline (keep as-is)
- url: The original URL (keep as-is)
- importance: 1-10 (10 = most significant global impact)
- category: one of: health | environment | science | justice | community | human-interest | innovation
- summary: One sentence on why this matters to the world
- is_headline: true for the SINGLE most important positive story (only one!)

Return a JSON array. Select the top 20-30 best stories maximum.
Return ONLY valid JSON, no markdown fences or explanation.`;

export async function curateWithClaude(
  stories: RawStory[]
): Promise<ClaudeCurationResult[]> {
  if (!stories.length) {
    console.log("[Claude] No stories to curate");
    return [];
  }

  const headlines = stories
    .map((s, i) => `${i + 1}. "${s.title}" — ${s.url}`)
    .join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Here are today's news headlines. Select and rank the genuinely positive ones:\n\n${headlines}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response, handling potential markdown fences
    const jsonStr = text
      .replace(/^```json?\s*/m, "")
      .replace(/```\s*$/m, "")
      .trim();

    const results: ClaudeCurationResult[] = JSON.parse(jsonStr);

    // Validate and ensure only one headline
    let headlineCount = 0;
    for (const result of results) {
      if (result.is_headline) {
        headlineCount++;
        if (headlineCount > 1) {
          result.is_headline = false;
        }
      }
    }

    // If no headline was selected, pick the highest importance
    if (headlineCount === 0 && results.length > 0) {
      const best = results.reduce((a, b) =>
        a.importance > b.importance ? a : b
      );
      best.is_headline = true;
    }

    console.log(
      `[Claude] Curated ${results.length} stories from ${stories.length} candidates`
    );
    return results;
  } catch (err) {
    console.error("[Claude] Curation error:", err);
    return [];
  }
}
