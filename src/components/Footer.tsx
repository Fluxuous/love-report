import ScoreToggle from "./ScoreToggle";
import SubscribeForm from "./SubscribeForm";

export default function Footer() {
  return (
    <footer className="lr-footer">
      <SubscribeForm />
      <div style={{ marginTop: 8 }}>
        <a href="/about" className="lr-footer-link">ABOUT</a>
        {" | "}
        <ScoreToggle />
        {" | "}
        LOVE REPORT &copy; 2026
      </div>
    </footer>
  );
}
