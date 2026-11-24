import type {IstiftaItem, SearchOptions} from '../types/book.ts';
import {
  matchesRulingFilter,
  normalizePersian,
  parseQuestionNumberQuery,
} from './persian.ts';

export interface IndexedQuestion {
  item: IstiftaItem;
  normQ: string;
  normA: string;
  normAll: string;
}

export function buildSearchIndex(questions: IstiftaItem[]): IndexedQuestion[] {
  return questions.map(item => {
    const normQ = normalizePersian(item.question);
    const normA = normalizePersian(item.answer + ' ' + item.footnotes.join(' '));
    return {
      item,
      normQ,
      normA,
      normAll: `${normQ} ${normA}`,
    };
  });
}

export interface SearchResult {
  items: IstiftaItem[];
  directQuestionMatch: number | null;
}

export function searchQuestions(
  index: IndexedQuestion[],
  options: SearchOptions,
  bookmarkIds?: Set<number>,
  noteIds?: Set<number>,
): SearchResult {
  const trimmed = options.query.trim();
  const directNum = trimmed ? parseQuestionNumberQuery(trimmed) : null;
  const normQuery = normalizePersian(trimmed);
  const tokens = normQuery ? normQuery.split(' ').filter(Boolean) : [];

  const chapterSet =
    options.chapterIds.length > 0 ? new Set(options.chapterIds) : null;

  const scored: Array<{item: IstiftaItem; score: number}> = [];

  for (const entry of index) {
    const {item, normQ, normA, normAll} = entry;

    if (chapterSet && !chapterSet.has(item.chapterId)) continue;
    if (options.subtopicId && item.subtopicId !== options.subtopicId) continue;
    if (options.onlyBookmarked && bookmarkIds && !bookmarkIds.has(item.id)) continue;
    if (options.onlyWithNotes && noteIds && !noteIds.has(item.id)) continue;
    if (!matchesRulingFilter(item.answer, options.ruling)) continue;

    if (!trimmed) {
      scored.push({item, score: 1});
      continue;
    }

    // Direct question number match gets highest priority
    if (directNum !== null && item.id === directNum) {
      scored.push({item, score: 1000});
      continue;
    }

    const target =
      options.scope === 'question'
        ? normQ
        : options.scope === 'answer'
          ? normA
          : normAll;

    let matched = false;
    let score = 0;

    if (options.matchMode === 'exact') {
      if (target.includes(normQuery)) {
        matched = true;
        score = normQ.includes(normQuery) ? 120 : 80;
      }
    } else if (options.matchMode === 'all') {
      matched = tokens.every(tok => target.includes(tok));
      if (matched) {
        score = target.includes(normQuery) ? 100 : 50;
        if (tokens.every(tok => normQ.includes(tok))) score += 25;
      }
    } else {
      // 'any'
      let hits = 0;
      for (const tok of tokens) {
        if (target.includes(tok)) hits++;
      }
      if (hits > 0) {
        matched = true;
        score = hits * 20 + (target.includes(normQuery) ? 40 : 0);
      }
    }

    if (matched) {
      scored.push({item, score});
    }
  }

  // Sort by relevance when searching text, otherwise preserve book order (id ascending)
  if (trimmed) {
    scored.sort((a, b) => b.score - a.score || a.item.id - b.item.id);
  } else {
    scored.sort((a, b) => a.item.id - b.item.id);
  }

  return {
    items: scored.map(s => s.item),
    directQuestionMatch: directNum,
  };
}
