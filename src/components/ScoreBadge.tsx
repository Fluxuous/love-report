"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [visible]);

  const toggleTooltip = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible((v) => !v);
  }, []);

  if (!scores) return null;

  const score = highestGood ?? 0;

  return (
    <span ref={wrapperRef} className="score-inline">
      <span className="score-badge" onClick={toggleTooltip} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {score.toFixed(1)}
      </span>
      {visible && (
        <span className="score-tooltip" onClick={(e) => e.stopPropagation()}>
          <span className="score-tooltip-header">
            HIGHEST GOOD: {score.toFixed(1)}
          </span>
          <span className="score-tooltip-dimensions">
            {DIMENSION_META.map((dim) => {
              const value = scores[dim.key] || 0;
              const name = SHORT_NAMES[dim.key] || dim.name;
              return (
                <span key={dim.key} className="score-dimension">
                  <a href={`/about#${dim.key}`} className="score-dimension-label" onClick={(e) => e.stopPropagation()}>
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
      )}
    </span>
  );
}
