/**
 * Normalises a rowing event name or search query to a canonical plain-English
 * form so that "JM16 2-" and "junior men u16 pair" both resolve to the same
 * tokens and can be compared.
 */
export function normalizeRowingText(text) {
  return text
    .toLowerCase()
    // Compound gender+age codes must come first (JM16, JW14, BM16, etc.)
    .replace(/\bjm(\d+)\b/g, 'junior men u$1')
    .replace(/\bjw(\d+)\b/g, 'junior women u$1')
    .replace(/\bbm(\d+)\b/g, 'men u$1')
    .replace(/\bbw(\d+)\b/g, 'women u$1')
    // Plain gender codes
    .replace(/\bjm\b/g, 'junior men')
    .replace(/\bjw\b/g, 'junior women')
    .replace(/\bsm\b/g, 'senior men')
    .replace(/\bsw\b/g, 'senior women')
    // Gender word variants → canonical
    .replace(/\b(?:boys?|male|mens?)\b/g, 'men')
    .replace(/\b(?:girls?|female|womens?)\b/g, 'women')
    // Age groups
    .replace(/\bu19\b/g, 'junior')
    .replace(/\bunder[\s-]?(\d+)\b/g, 'u$1')
    // Boat classes: symbols → words
    .replace(/\b1x\b/g, 'single')
    .replace(/\b2x\b/g, 'double')
    .replace(/\b2-\b/g, 'pair')
    .replace(/\b2\+\b/g, 'pair')
    .replace(/\b4x\b/g, 'quad')
    .replace(/\b4-\b/g, 'four')
    .replace(/\b4\+\b/g, 'four')
    .replace(/\b8\+\b/g, 'eight')
    // Boat class word variants → canonical
    .replace(/\bsculls?\b/g, 'single')
    .replace(/\bpairs?\b/g, 'pair')
    .replace(/\bfours?\b/g, 'four')
    .replace(/\bquads?\b/g, 'quad')
    .replace(/\beights?\b/g, 'eight')
    .replace(/\bdoubles?\b/g, 'double')
    .replace(/\bsingles?\b/g, 'single')
    // Coxed/coxless
    .replace(/\bcoxless\b|\bwithout\b/g, 'coxless')
    .replace(/\bcoxed\b|\bwith cox\b/g, 'coxed');
}

/**
 * Returns true if every word in the (normalised) query appears somewhere
 * in the (normalised) event name.
 *
 * e.g. matchesEventQuery("JM16 2-", "junior mens pair")  →  true
 *      matchesEventQuery("SW 8+",   "junior mens pair")  →  false
 */
export function matchesEventQuery(eventName, query) {
  if (!query.trim()) return false;
  const normEvent = normalizeRowingText(eventName);
  const normQuery = normalizeRowingText(query);
  const words = normQuery.trim().split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return false;
  return words.every(word => normEvent.includes(word));
}
