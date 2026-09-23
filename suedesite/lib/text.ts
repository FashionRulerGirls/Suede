// Shared text helpers.

// Truncate to `max` characters for card previews, cutting on a word boundary
// (when one is reasonably close) and appending an ellipsis. The full text stays
// available on the detail page via "See Full Review".
export function truncate(text: string | undefined | null, max = 250): string {
  const s = (text || '').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max - 40 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s.,;:!?-]+$/, '') + '…';
}
