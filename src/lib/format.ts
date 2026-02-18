const SMALL_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor',
  'for', 'yet', 'so', 'in', 'on', 'at', 'to',
  'by', 'of', 'up', 'as', 'is', 'if', 'it', 'no',
]);

/** Normalize headlines to title case. Converts when >40% of alpha chars are uppercase. */
export function toTitleCase(str: string): string {
  const alpha = str.replace(/[^a-zA-Z]/g, '');
  const upper = alpha.replace(/[^A-Z]/g, '');
  if (alpha.length > 0 && upper.length / alpha.length < 0.4) return str;

  return str.split(' ').map((word, i) => {
    if (/\d/.test(word)) return word;
    // Preserve 2-letter acronyms (UN, US, EU, UK, etc.)
    if (/^[A-Z]{2}$/.test(word) && !SMALL_WORDS.has(word.toLowerCase())) return word;
    const lower = word.toLowerCase();
    if (i === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
    if (SMALL_WORDS.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}
