/**
 * Universal Search Helper
 * Matches query across text strings, numbers, dates, and related entity names.
 */
export const matchesUniversalSearch = (
  item: Record<string, any>,
  query: string,
  extraTerms: (string | number | undefined | null)[] = []
): boolean => {
  if (!query || !query.trim()) return true;

  const cleanQuery = query.trim().toLowerCase();
  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

  // Collect all searchable strings & numbers from the item and extraTerms
  const valuesToSearch: string[] = [];

  // Add extra lookup terms (e.g. storage name, variety name, block name, status)
  for (const term of extraTerms) {
    if (term !== undefined && term !== null) {
      valuesToSearch.push(String(term).toLowerCase());
    }
  }

  // Add object values
  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      valuesToSearch.push(value.toLowerCase());

      // If it looks like a date (YYYY-MM-DD), also format as DD/MM/YYYY and Month Year
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            valuesToSearch.push(d.toLocaleDateString('en-GB')); // DD/MM/YYYY
            valuesToSearch.push(
              d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }).toLowerCase()
            );
            valuesToSearch.push(
              d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()
            );
          }
        } catch (_) {}
      }
    } else if (typeof value === 'number') {
      valuesToSearch.push(String(value));
      valuesToSearch.push(value.toLocaleString());
    } else if (typeof value === 'boolean') {
      valuesToSearch.push(value ? 'true' : 'false');
    }
  }

  const combinedSearchCorpus = valuesToSearch.join(' ');

  // All words in query must match somewhere in the corpus
  return queryWords.every((word) => combinedSearchCorpus.includes(word));
};
