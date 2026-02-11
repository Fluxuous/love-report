"use client";

import { useCallback, useState } from "react";

export default function ScoreToggle() {
  const [active, setActive] = useState(false);

  const toggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("show-scores");
      } else {
        document.body.classList.remove("show-scores");
      }
      return next;
    });
  }, []);

  return (
    <button className="score-toggle" onClick={toggle} type="button">
      {active ? "HIDE SCORES" : "SCORES"}
    </button>
  );
}
