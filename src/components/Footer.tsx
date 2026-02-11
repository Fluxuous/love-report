import ScoreToggle from "./ScoreToggle";

export default function Footer() {
  return (
    <footer className="lr-footer">
      <a href="/about" className="lr-footer-link">ABOUT</a>
      {" | "}
      <ScoreToggle />
      {" | "}
      LOVE REPORT &copy; 2026
    </footer>
  );
}
