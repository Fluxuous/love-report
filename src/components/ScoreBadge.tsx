import { EthicalScores } from "@/lib/types";
import { DIMENSION_META } from "@/lib/curation/scoring";

/** Short names for tight tooltip layout */
const SHORT_NAMES: Record<string, string> = {
  transcendence: "Transcend.",
  compassion: "Compass.",
};

interface ScoreBadgeProps {
  scores?: EthicalScores;
  highestGood?: number;
  summary?: string;
}

export default function ScoreBadge({ scores, highestGood, summary }: ScoreBadgeProps) {
  if (!scores) return null;

  const score = highestGood ?? 0;

  return (
    <span className="score-inline">
      <span className="score-badge">
        {score.toFixed(1)}
      </span>
      <span className="score-tooltip">
        <span className="score-tooltip-header">
          HIGHEST GOOD: {score.toFixed(1)}
        </span>
        <span className="score-tooltip-dimensions">
          {DIMENSION_META.map((dim) => {
            const value = scores[dim.key] || 0;
            const name = SHORT_NAMES[dim.key] || dim.name;
            return (
              <span key={dim.key} className="score-dimension">
                <a href={`/about#${dim.key}`} className="score-dimension-label">
                  <span className="score-dimension-emoji">{dim.emoji}</span>
                  <span className="score-dimension-name">{name}</span>
                </a>
                <span className="score-bar-track">
                  <span className="score-bar-fill" style={{ width: `${(value / 10) * 100}%`, backgroundColor: dim.color }} />
                </span>
                <span className="score-dimension-value">{value.toFixed(1)}</span>
              </span>
            );
          })}
        </span>
        {summary && <span className="score-tooltip-summary">{summary}</span>}
      </span>
    </span>
  );
}
