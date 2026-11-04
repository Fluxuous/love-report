import { NewsletterContent } from "./newsletter";
import { CuratedStory } from "./types";
import { DIMENSION_META, DimensionKey } from "./curation/scoring";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://love-report-rosy.vercel.app";

function scoreColor(score: number): string {
  if (score >= 8.0) return "#c0392b";
  if (score >= 6.0) return "#d4a017";
  return "#555";
}

function scoreBadge(score: number): string {
  return `<span style="display:inline-block;background:${scoreColor(score)};color:#fff;font-size:11px;font-weight:bold;padding:1px 5px;border-radius:2px;font-family:Georgia,serif;margin-right:6px;">${score.toFixed(1)}</span>`;
}

function dimensionBar(key: DimensionKey, score: number): string {
  const meta = DIMENSION_META.find((d) => d.key === key);
  if (!meta) return "";
  const pct = Math.round((score / 10) * 100);
  return `<tr>
    <td style="font-size:12px;padding:1px 8px 1px 0;color:#666;font-family:Georgia,serif;white-space:nowrap;">${meta.emoji} ${meta.name}</td>
    <td style="width:100%;padding:1px 0;">
      <div style="background:#eee;height:8px;border-radius:2px;overflow:hidden;">
        <div style="background:${meta.color};width:${pct}%;height:100%;"></div>
      </div>
    </td>
    <td style="font-size:11px;padding:1px 0 1px 6px;color:#888;font-family:Georgia,serif;text-align:right;">${score.toFixed(1)}</td>
  </tr>`;
}

function storyLink(story: CuratedStory): string {
  const score = story.highest_good ?? story.importance;
  const isHigh = score >= 8.0;
  return `<tr>
    <td style="padding:6px 0;border-bottom:1px solid #eee;">
      ${scoreBadge(score)}
      <a href="${story.url}" style="color:${isHigh ? "#c0392b" : "#000"};text-decoration:none;font-family:Georgia,serif;font-size:14px;font-weight:${isHigh ? "bold" : "normal"};">${story.display_title}</a>
      <span style="color:#999;font-size:11px;font-family:Georgia,serif;margin-left:4px;">(${story.source})</span>
      ${story.summary ? `<br><span style="color:#666;font-size:12px;font-family:Georgia,serif;">${story.summary}</span>` : ""}
    </td>
  </tr>`;
}

export function renderNewsletterHtml(
  content: NewsletterContent,
  unsubscribeEmail: string
): string {
  const { date, banner, topStories, tension, spotlight } = content;
  const bannerScore = banner.highest_good ?? banner.importance;

  // Build dimension scores table for banner
  let bannerScoresHtml = "";
  if (banner.ai_scores) {
    const rows = DIMENSION_META.map((d) =>
      dimensionBar(d.key, banner.ai_scores![d.key] || 0)
    ).join("");
    bannerScoresHtml = `<table style="width:100%;border-collapse:collapse;margin-top:8px;">${rows}</table>`;
  }

  // Build top stories list
  const topStoriesHtml = topStories.map(storyLink).join("");

  // Build tension section
  let tensionHtml = "";
  if (tension) {
    const ts = tension.story;
    const tsScore = ts.highest_good ?? ts.importance;
    tensionHtml = `
    <tr><td style="padding:20px 0 8px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#000;padding-bottom:4px;border-bottom:2px solid #000;">
          TENSION OF THE DAY
        </td></tr>
        <tr><td style="padding:8px 0 4px 0;font-family:Georgia,serif;font-size:12px;color:#8e44ad;font-weight:bold;letter-spacing:1px;">
          ${tension.highDim.emoji} ${tension.highDim.name.toUpperCase()} vs ${tension.lowDim.emoji} ${tension.lowDim.name.toUpperCase()}
        </td></tr>
        <tr><td style="padding:4px 0;">
          ${scoreBadge(tsScore)}
          <a href="${ts.url}" style="color:#000;text-decoration:none;font-family:Georgia,serif;font-size:14px;font-weight:bold;">${ts.display_title}</a>
          <span style="color:#999;font-size:11px;font-family:Georgia,serif;margin-left:4px;">(${ts.source})</span>
        </td></tr>
        ${tension.note ? `<tr><td style="padding:4px 0 0 0;font-family:Georgia,serif;font-size:13px;color:#444;font-style:italic;">${tension.note}</td></tr>` : ""}
      </table>
    </td></tr>`;
  }

  // Build spotlight section
  const sp = spotlight;
  const spScore = sp.story.ai_scores?.[sp.dimension.key] || 0;
  const spotlightHtml = `
  <tr><td style="padding:20px 0 8px 0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#000;padding-bottom:4px;border-bottom:2px solid #000;">
        ${sp.dimension.emoji} TODAY'S MOST ${sp.dimension.name.toUpperCase()} STORY
      </td></tr>
      <tr><td style="padding:8px 0 2px 0;font-family:Georgia,serif;font-size:12px;color:${sp.dimension.color};font-style:italic;">
        "${sp.dimension.question}"
      </td></tr>
      <tr><td style="padding:4px 0;">
        ${scoreBadge(sp.story.highest_good ?? sp.story.importance)}
        <a href="${sp.story.url}" style="color:#000;text-decoration:none;font-family:Georgia,serif;font-size:14px;font-weight:bold;">${sp.story.display_title}</a>
        <span style="color:#999;font-size:11px;font-family:Georgia,serif;margin-left:4px;">(${sp.story.source})</span>
        ${sp.story.summary ? `<br><span style="color:#666;font-size:12px;font-family:Georgia,serif;">${sp.story.summary}</span>` : ""}
      </td></tr>
      <tr><td style="padding:4px 0 0 0;font-family:Georgia,serif;font-size:12px;color:#888;">
        ${sp.dimension.name} score: <strong style="color:${sp.dimension.color};">${spScore.toFixed(1)}</strong> / 10.0
      </td></tr>
    </table>
  </td></tr>`;

  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;">
<table style="width:100%;max-width:600px;margin:0 auto;background:#fff;border-collapse:collapse;">

  <!-- Header -->
  <tr><td style="padding:20px 24px 12px 24px;text-align:center;border-bottom:3px solid #000;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#c0392b;letter-spacing:2px;">LOVE REPORT</div>
    </a>
    <div style="font-family:Georgia,serif;font-size:12px;color:#888;margin-top:2px;">${date}</div>
    <div style="font-family:Georgia,serif;font-size:11px;color:#aaa;margin-top:2px;">All the news that's fit to love.</div>
  </td></tr>

  <!-- Banner Story -->
  <tr><td style="padding:16px 24px 8px 24px;">
    <table style="width:100%;border-collapse:collapse;">
      ${banner.image_url ? `<tr><td style="padding:0 0 8px 0;"><img src="${banner.image_url}" alt="" style="width:100%;max-height:250px;object-fit:cover;display:block;border-radius:2px;"></td></tr>` : ""}
      <tr><td>
        ${scoreBadge(bannerScore)}
        <a href="${banner.url}" style="color:#c0392b;text-decoration:none;font-family:Georgia,serif;font-size:20px;font-weight:bold;">${banner.display_title}</a>
      </td></tr>
      <tr><td style="padding:4px 0 0 0;">
        <span style="color:#999;font-size:11px;font-family:Georgia,serif;">${banner.source}</span>
        ${banner.summary ? `<span style="color:#666;font-size:12px;font-family:Georgia,serif;margin-left:8px;">${banner.summary}</span>` : ""}
      </td></tr>
      <tr><td style="padding:8px 0 0 0;">${bannerScoresHtml}</td></tr>
    </table>
  </td></tr>

  <!-- Top Stories -->
  <tr><td style="padding:16px 24px 8px 24px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#000;padding-bottom:4px;border-bottom:2px solid #000;">
        TOP STORIES
      </td></tr>
      ${topStoriesHtml}
    </table>
  </td></tr>

  <!-- Tension of the Day -->
  ${tensionHtml ? `<tr><td style="padding:0 24px;">${tensionHtml}</td></tr>` : ""}

  <!-- Dimension Spotlight -->
  <tr><td style="padding:0 24px;">${spotlightHtml}</td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px;text-align:center;border-top:2px solid #000;margin-top:16px;">
    <div style="font-family:Georgia,serif;font-size:11px;color:#888;">
      <a href="${SITE_URL}" style="color:#c0392b;text-decoration:none;">Read more at Love Report</a>
    </div>
    <div style="font-family:Georgia,serif;font-size:10px;color:#bbb;margin-top:8px;">
      <a href="${unsubscribeUrl}" style="color:#bbb;text-decoration:underline;">Unsubscribe</a>
    </div>
  </td></tr>

</table>
</body>
</html>`;
}

export function renderNewsletterText(
  content: NewsletterContent
): string {
  const { date, banner, topStories, tension, spotlight } = content;
  const lines: string[] = [];

  lines.push("LOVE REPORT");
  lines.push(date);
  lines.push("All the news that's fit to love.");
  lines.push("");
  lines.push("---");
  lines.push("");

  const bs = banner.highest_good ?? banner.importance;
  lines.push(`[${bs.toFixed(1)}] ${banner.display_title}`);
  lines.push(`  ${banner.source} — ${banner.summary || ""}`);
  lines.push(`  ${banner.url}`);
  lines.push("");

  lines.push("TOP STORIES");
  lines.push("");
  for (const story of topStories) {
    const s = story.highest_good ?? story.importance;
    lines.push(`[${s.toFixed(1)}] ${story.display_title} (${story.source})`);
    if (story.summary) lines.push(`  ${story.summary}`);
    lines.push(`  ${story.url}`);
    lines.push("");
  }

  if (tension) {
    lines.push("---");
    lines.push("TENSION OF THE DAY");
    lines.push(`${tension.highDim.name} vs ${tension.lowDim.name}`);
    const ts = tension.story.highest_good ?? tension.story.importance;
    lines.push(`[${ts.toFixed(1)}] ${tension.story.display_title} (${tension.story.source})`);
    if (tension.note) lines.push(tension.note);
    lines.push(`  ${tension.story.url}`);
    lines.push("");
  }

  lines.push("---");
  lines.push(`TODAY'S MOST ${spotlight.dimension.name.toUpperCase()} STORY`);
  lines.push(`"${spotlight.dimension.question}"`);
  const sps = spotlight.story.highest_good ?? spotlight.story.importance;
  lines.push(`[${sps.toFixed(1)}] ${spotlight.story.display_title} (${spotlight.story.source})`);
  if (spotlight.story.summary) lines.push(spotlight.story.summary);
  lines.push(`  ${spotlight.story.url}`);

  return lines.join("\n");
}
