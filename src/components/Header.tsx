export default function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="text-center py-6 border-b-4 border-double border-gold">
      <h1 className="font-serif text-5xl md:text-6xl font-bold text-gold tracking-tight">
        LOVE REPORT
      </h1>
      <p className="font-serif text-lg text-warm-brown/70 italic mt-1">
        &ldquo;Where&apos;s the Gold?&rdquo;
      </p>
      <p className="text-xs text-warm-brown/50 mt-2 uppercase tracking-widest">
        {dateStr}
      </p>
    </header>
  );
}
