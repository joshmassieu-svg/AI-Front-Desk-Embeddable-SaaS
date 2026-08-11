/**
 * Splits text into overlapping chunks sized for embedding. We chunk by
 * approximate word count rather than a real tokenizer — close enough for
 * this use case, and avoids pulling in a tokenizer dependency.
 *
 * ~400 tokens ≈ ~300 words for typical English text. 15% overlap so an
 * answer that straddles a chunk boundary doesn't get cut in half.
 */

export interface TextChunk {
  text: string;
  index: number;
}

const WORDS_PER_CHUNK = 300;
const OVERLAP_WORDS = 45;

export function chunkText(text: string, sourceLabel?: string): TextChunk[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const words = cleaned.split(' ');
  if (words.length <= WORDS_PER_CHUNK) {
    return [{ text: cleaned, index: 0 }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const end = Math.min(start + WORDS_PER_CHUNK, words.length);
    const chunkWords = words.slice(start, end);
    let chunkText = chunkWords.join(' ');
    if (sourceLabel) {
      chunkText = `[${sourceLabel}]\n${chunkText}`;
    }
    chunks.push({ text: chunkText, index });
    index++;

    if (end === words.length) break;
    start = end - OVERLAP_WORDS;
  }

  return chunks;
}
