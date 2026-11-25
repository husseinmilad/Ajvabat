import type {IstiftaItem, SearchOptions} from '../types/book.ts';
import {
  getPersianLemmas,
  matchesRulingFilter,
  normalizePersian,
  parseQuestionNumberQuery,
  tokenizePersian,
} from './persian.ts';

export interface IndexedQuestion {
  item: IstiftaItem;
  normQ: string;
  normA: string;
  normAll: string;
  qWords: Set<string>;
  aWords: Set<string>;
  allWords: Set<string>;
  qLemmas: Set<string>;
  aLemmas: Set<string>;
  allLemmas: Set<string>;
}

function buildLemmaSet(words: string[]): Set<string> {
  const set = new Set<string>();
  for (const w of words) {
    for (const lemma of getPersianLemmas(w)) {
      set.add(lemma);
    }
  }
  return set;
}

export function buildSearchIndex(questions: IstiftaItem[]): IndexedQuestion[] {
  return questions.map(item => {
    const normQ = normalizePersian(item.question);
    const normA = normalizePersian(item.answer + ' ' + item.footnotes.join(' '));
    const normAll = `${normQ} ${normA}`.trim();

    const qTokenList = normQ ? normQ.split(' ').filter(Boolean) : [];
    const aTokenList = normA ? normA.split(' ').filter(Boolean) : [];
    const allTokenList = [...qTokenList, ...aTokenList];

    return {
      item,
      normQ,
      normA,
      normAll,
      qWords: new Set(qTokenList),
      aWords: new Set(aTokenList),
      allWords: new Set(allTokenList),
      qLemmas: buildLemmaSet(qTokenList),
      aLemmas: buildLemmaSet(aTokenList),
      allLemmas: buildLemmaSet(allTokenList),
    };
  });
}

export interface SearchResult {
  items: IstiftaItem[];
  directQuestionMatch: number | null;
  usedMorphologicalMatch: boolean;
}

/**
 * Scores a single query token against a document's word & lemma sets:
 * - Tier 1 (30): Exact whole-word match
 * - Tier 2 (18): Morphological / plural / lemma match (e.g. پرنده <-> پرندگان)
 * - Tier 3 (8): Word-prefix match (length >= 4, e.g. مسافر -> مسافرت), never arbitrary mid-word substring
 * Returns 0 if no match.
 */
function scoreTokenMatch(
  tok: string,
  tokLemmas: string[],
  words: Set<string>,
  lemmas: Set<string>,
): {score: number; viaMorphology: boolean} {
  if (words.has(tok)) {
    return {score: 30, viaMorphology: false};
  }
  for (const l of tokLemmas) {
    if (lemmas.has(l)) {
      return {score: 18, viaMorphology: true};
    }
  }
  if (tok.length >= 4) {
    for (const w of words) {
      if (w.startsWith(tok)) {
        return {score: 8, viaMorphology: true};
      }
    }
  }
  return {score: 0, viaMorphology: false};
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const tokens = tokenizePersian(trimmed);
  const tokenLemmas = tokens.map(t => getPersianLemmas(t));

  const exactPhraseRegex =
    options.matchMode === 'exact' && normQuery
      ? new RegExp(`(?:^|\\s)${escapeRegExp(normQuery)}(?:$|\\s)`)
      : null;

  const chapterSet =
    options.chapterIds.length > 0 ? new Set(options.chapterIds) : null;

  const scored: Array<{item: IstiftaItem; score: number; morphOnly: boolean}> = [];

  for (const entry of index) {
    const {
      item,
      normQ,
      normA,
      normAll,
      qWords,
      aWords,
      allWords,
      qLemmas,
      aLemmas,
      allLemmas,
    } = entry;

    if (chapterSet && !chapterSet.has(item.chapterId)) continue;
    if (options.subtopicId && item.subtopicId !== options.subtopicId) continue;
    if (options.onlyBookmarked && bookmarkIds && !bookmarkIds.has(item.id)) continue;
    if (options.onlyWithNotes && noteIds && !noteIds.has(item.id)) continue;
    if (!matchesRulingFilter(item.answer, options.ruling)) continue;

    if (!trimmed) {
      scored.push({item, score: 1, morphOnly: false});
      continue;
    }

    // Direct question number match gets highest priority
    if (directNum !== null && item.id === directNum) {
      scored.push({item, score: 1000, morphOnly: false});
      continue;
    }

    const targetText =
      options.scope === 'question'
        ? normQ
        : options.scope === 'answer'
          ? normA
          : normAll;
    const targetWords =
      options.scope === 'question'
        ? qWords
        : options.scope === 'answer'
          ? aWords
          : allWords;
    const targetLemmas =
      options.scope === 'question'
        ? qLemmas
        : options.scope === 'answer'
          ? aLemmas
          : allLemmas;

    let matched = false;
    let score = 0;
    let morphOnly = false;

    if (options.matchMode === 'exact') {
      if (exactPhraseRegex && exactPhraseRegex.test(targetText)) {
        matched = true;
        score = exactPhraseRegex.test(normQ) ? 160 : 120;
      } else if (tokens.length === 1) {
        const res = scoreTokenMatch(tokens[0], tokenLemmas[0], targetWords, targetLemmas);
        if (res.score > 0 && !res.viaMorphology) {
          matched = true;
          score = res.score + (qWords.has(tokens[0]) ? 40 : 0);
        }
      }
    } else if (options.matchMode === 'all') {
      if (tokens.length > 0) {
        let allHit = true;
        let totalTokenScore = 0;
        let usedMorph = false;
        let allInQ = true;

        for (let i = 0; i < tokens.length; i++) {
          const res = scoreTokenMatch(tokens[i], tokenLemmas[i], targetWords, targetLemmas);
          if (res.score === 0) {
            allHit = false;
            break;
          }
          totalTokenScore += res.score;
          if (res.viaMorphology) usedMorph = true;
          if (scoreTokenMatch(tokens[i], tokenLemmas[i], qWords, qLemmas).score === 0) {
            allInQ = false;
          }
        }

        if (allHit) {
          matched = true;
          morphOnly = usedMorph;
          score = totalTokenScore + (allInQ ? 35 : 0);
          if (normQuery && targetText.includes(normQuery)) {
            score += 45;
          }
        }
      }
    } else {
      // 'any'
      let hits = 0;
      let totalTokenScore = 0;
      let anyExact = false;
      for (let i = 0; i < tokens.length; i++) {
        const res = scoreTokenMatch(tokens[i], tokenLemmas[i], targetWords, targetLemmas);
        if (res.score > 0) {
          hits++;
          totalTokenScore += res.score;
          if (!res.viaMorphology) anyExact = true;
        }
      }
      if (hits > 0) {
        matched = true;
        morphOnly = !anyExact;
        score = totalTokenScore + hits * 10 + (normQuery && targetText.includes(normQuery) ? 35 : 0);
      }
    }

    if (matched) {
      scored.push({item, score, morphOnly});
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
    usedMorphologicalMatch: scored.some(s => s.morphOnly),
  };
}
