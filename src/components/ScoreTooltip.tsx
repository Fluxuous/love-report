"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { EthicalScores } from "@/lib/types";
import { DIMENSION_META } from "@/lib/curation/scoring";

interface ScoreTooltipProps {
  scores?: EthicalScores;
  highestGood?: number;
  summary?: string;
  children: React.ReactNode;
}

export default function ScoreTooltip({
  scores,
  highestGood,
  summary,
  children,
}: ScoreTooltipProps) {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setVisible(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!visible) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [visible]);

  // Prevent link navigation on long-press
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      didLongPress.current = false;
    }
  }, []);

  // No scores = just render children (after all hooks)
  if (!scores) return <>{children}</>;

  return (
    <span
      ref={wrapperRef}
      className="score-tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      {visible && (
        <div className="score-tooltip" onClick={(e) => e.stopPropagation()}>
          <div className="score-tooltip-header">
            HIGHEST GOOD: {highestGood?.toFixed(1) ?? "\u2014"}
          </div>
          <div className="score-tooltip-dimensions">
            {DIMENSION_META.map((dim) => {
              const value = scores[dim.key] || 0;
              return (
                <div key={dim.key} className="score-dimension">
                  <a
                    href={`/about#${dim.key}`}
                    className="score-dimension-label"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="score-dimension-emoji">{dim.emoji}</span>
                    <span className="score-dimension-name">{dim.name}</span>
                  </a>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${(value / 10) * 100}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                  <span className="score-dimension-value">
                    {value.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          {summary && <div className="score-tooltip-summary">{summary}</div>}
        </div>
      )}
    </span>
  );
}
