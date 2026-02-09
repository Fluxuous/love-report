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
- index: The story number from the list (e.g. 1, 5, 23)
- importance: 1-10 (10 = most significant global impact)
- category: one of: health | environment | science | justice | community | human-interest | innovation
- summary: One SHORT sentence on why this matters (max 15 words)
- is_headline: true for the SINGLE most important positive story (only one!)

Return a JSON array of objects with keys: index, importance, category, summary, is_headline.
Select the top 20-25 best stories maximum.
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
    console.log(`[Claude] Sending ${stories.length} headlines (${headlines.length} chars) to Haiku...`);
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

    console.log(`[Claude] Response length: ${text.length} chars, stop_reason: ${message.stop_reason}`);

    // Parse JSON response, handling potential markdown fences
    const jsonStr = text
      .replace(/^```json?\s*/m, "")
      .replace(/```\s*$/m, "")
      .trim();

    interface ClaudeIndexResult {
      index: number;
      importance: number;
      category: string;
      summary: string;
      is_headline: boolean;
    }

    let indexed: ClaudeIndexResult[];
    try {
      indexed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("[Claude] Failed to parse JSON response:", jsonStr.slice(0, 500));
      throw parseErr;
    }

    // Map indices back to original stories
    const results: ClaudeCurationResult[] = [];
    let headlineCount = 0;

    for (const item of indexed) {
      const storyIdx = item.index - 1; // 1-indexed to 0-indexed
      if (storyIdx < 0 || storyIdx >= stories.length) continue;

      const story = stories[storyIdx];
      if (item.is_headline) {
        headlineCount++;
        if (headlineCount > 1) item.is_headline = false;
      }

      results.push({
        title: story.title,
        url: story.url,
        importance: item.importance,
        category: item.category as ClaudeCurationResult["category"],
        summary: item.summary,
        is_headline: item.is_headline,
      });
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
