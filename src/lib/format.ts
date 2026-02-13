const SMALL_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor',
  'for', 'yet', 'so', 'in', 'on', 'at', 'to',
  'by', 'of', 'up', 'as', 'is', 'if', 'it', 'no',
]);

/** Convert ALL CAPS headline to Title Case. Preserves acronyms and numbers. */
export function toTitleCase(str: string): string {
  if (str !== str.toUpperCase()) return str;

  return str.split(' ').map((word, i) => {
    if (/\d/.test(word)) return word;
    if (/^[A-Z]{2,5}$/.test(word) && !SMALL_WORDS.has(word.toLowerCase())) return word;
    const lower = word.toLowerCase();
    if (i === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
    if (SMALL_WORDS.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}
