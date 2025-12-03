/**
 * Normalize search input for PostgreSQL full-text search
 * PostgreSQL's plainto_tsquery will automatically handle stop words, stemming, and normalization
 */
export const normalizeSearchQuery = (input?: string): string => {
  if (!input) {
    return '';
  }

  // Just normalize and return - let PostgreSQL handle stop words and tokenization
  const normalized = input
    .trim()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ') // Keep alphanumeric and spaces
    .replace(/\s+/g, ' ')
    .toLowerCase();

  return normalized;
};

/**
 * @deprecated Use normalizeSearchQuery instead. PostgreSQL's plainto_tsquery is more accurate.
 * Legacy function for backward compatibility.
 */
export const buildTsQuery = normalizeSearchQuery;

/**
 * Generate excerpt from text highlighting search matches
 * Uses simple substring matching for basic contains search
 */
export const generateSimpleExcerpt = (
  text: string,
  searchTerm: string,
  maxWords: number = 40,
): string => {
  if (!text || !searchTerm) {
    return text?.substring(0, 200) || '';
  }

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase().trim();
  const index = lowerText.indexOf(lowerSearch);

  if (index === -1) {
    // No match found, return beginning
    return text.substring(0, 200) + (text.length > 200 ? '...' : '');
  }

  // Calculate excerpt boundaries
  const words = text.split(/\s+/);
  let currentPos = 0;
  let startWordIdx = 0;
  let endWordIdx = words.length;

  // Find word index containing the match
  for (let i = 0; i < words.length; i++) {
    const wordEnd = currentPos + words[i].length;
    if (currentPos <= index && index <= wordEnd) {
      // Found the word containing the match
      startWordIdx = Math.max(0, i - Math.floor(maxWords / 2));
      endWordIdx = Math.min(words.length, i + Math.floor(maxWords / 2));
      break;
    }
    currentPos = wordEnd + 1; // +1 for space
  }

  const excerpt = words.slice(startWordIdx, endWordIdx).join(' ');
  const prefix = startWordIdx > 0 ? '...' : '';
  const suffix = endWordIdx < words.length ? '...' : '';

  // Highlight the search term
  const highlightedExcerpt = excerpt.replace(
    new RegExp(`(${lowerSearch})`, 'gi'),
    '<mark>$1</mark>',
  );

  return prefix + highlightedExcerpt + suffix;
};

/**
 * Build PostgreSQL ts_headline configuration for excerpt generation
 */
export const buildTsHeadlineOptions = (): string => {
  return `'StartSel="<mark>", StopSel="</mark>", MaxWords=50, MinWords=25, ShortWord=3, HighlightAll=FALSE, MaxFragments=1'`;
};

/**
 * Strip HTML tags and markdown formatting from text
 * Used to clean text before applying search highlighting
 */
export const stripHtmlAndMarkdown = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  // Remove markdown formatting patterns
  // Headers: # ## ### etc.
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Bold/Italic: **text** *text* __text__ _text_
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // Strikethrough: ~~text~~
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // Inline code: `code`
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Code blocks: ```code```
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Links: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Images: ![alt](url) -> alt
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Blockquotes: > text
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Horizontal rules: --- or ***
  cleaned = cleaned.replace(/^[-*]{3,}$/gm, '');

  // Unordered lists: - or * or +
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');

  // Ordered lists: 1. 2. etc.
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

  // Strip all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'");

  // Normalize whitespace (convert multiple spaces/newlines to single space)
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

/**
 * English stop words - PostgreSQL default stop words
 * These are filtered out from search queries to improve relevance
 */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'will',
  'with',
  'this',
  'but',
  'or',
  'not',
]);

/**
 * Remove stop words from search query
 * Used for fallback search and excerpt generation
 */
export function removeStopWords(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.has(word))
    .join(' ');
}
