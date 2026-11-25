import type {RulingFilter} from '../types/book.ts';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toAsciiDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, ch => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, ch => String(ch.charCodeAt(0) - 0x0660));
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, d => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Normalizes Persian & Arabic text for forgiving, accurate full-text search:
 * - Converts Arabic yeh/alef-maksura (ي, ى, ئ) to Persian ی
 * - Converts Arabic kaf (ك) to Persian ک
 * - Unifies alef variants (أ, إ, آ, ٱ) to ا
 * - Unifies heh variants (ة, ۀ, ھ) to ه
 * - Strips Arabic diacritics (tashkeel), tatweel (ـ), and zero-width chars
 * - Normalizes digits to ASCII and collapses whitespace
 */
export function normalizePersian(input: string): string {
  if (!input) return '';
  return toAsciiDigits(input)
    .replace(/[\u064B-\u065F\u0670\u0640\u200c\u200d\u200e\u200f\ufeff]/g, '')
    .replace(/[يیىئ]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ةۀھ]/g, 'ه')
    .replace(/[.,،؛:؟!()«»\[\]\-–—/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Splits normalized Persian/Arabic text into clean word tokens,
 * preserving ZWNJ word boundaries for compound words when needed.
 */
export function tokenizePersian(input: string): string[] {
  const norm = normalizePersian(input);
  return norm ? norm.split(' ').filter(Boolean) : [];
}

/**
 * Generates canonical morphological lemma keys for a single normalized Persian word.
 * Handles common Persian plural & inflection patterns cleanly (including -ه <-> -گان
 * such as پرنده <-> پرندگان) without truncating words into false root substrings.
 */
export function getPersianLemmas(normalizedWord: string): string[] {
  const w = normalizedWord.trim();
  if (!w) return [];

  const lemmas = new Set<string>([w]);

  // Handle -ه <-> -گان / -گانی pluralization (e.g. پرنده <-> پرندگان)
  if (w.endsWith('ه') && w.length >= 3) {
    lemmas.add(`${w.slice(0, -1)}#h`);
  }
  if (w.endsWith('گان') && w.length >= 5) {
    const stem = w.slice(0, -3);
    lemmas.add(`${stem}#h`);
    lemmas.add(`${stem}ه`);
  } else if (w.endsWith('گانی') && w.length >= 6) {
    const stem = w.slice(0, -4);
    lemmas.add(`${stem}#h`);
    lemmas.add(`${stem}ه`);
  }

  // Strip common Persian plural / possessive / indefinite suffixes safely
  const suffixes = ['هایی', 'های', 'ها', 'یان', 'ان', 'ات', 'جات', 'ین', 'ام', 'اش', 'ای'];
  for (const suf of suffixes) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      const base = w.slice(0, -suf.length);
      lemmas.add(base);
      if (base.endsWith('ه')) {
        lemmas.add(`${base.slice(0, -1)}#h`);
      }
    }
  }

  // Trailing ی (nisba / indefinite / plural link) when remaining stem >= 3 chars
  if (w.endsWith('ی') && w.length >= 4) {
    const base = w.slice(0, -1);
    lemmas.add(base);
    if (base.endsWith('ه')) {
      lemmas.add(`${base.slice(0, -1)}#h`);
    }
  }

  // Strip verb prefix می / نمی when remaining stem >= 3 chars
  if (w.startsWith('نمی') && w.length >= 6) {
    lemmas.add(w.slice(3));
  } else if (w.startsWith('می') && w.length >= 5) {
    lemmas.add(w.slice(2));
  }

  return [...lemmas];
}

/**
 * Detects whether a user query refers directly to a question number (e.g. "458", "س ۴۵۸", "#458", "مساله ۱۲").
 * Returns the parsed integer 1..2118 or null.
 */
export function parseQuestionNumberQuery(query: string): number | null {
  const ascii = toAsciiDigits(query).trim();
  const match = ascii.match(/^(?:س|سؤال|سوال|مساله|مسأله|شماره|#)?\s*[:.]?\s*(\d{1,4})\s*\.?$/);
  if (!match) return null;
  const num = Number.parseInt(match[1], 10);
  if (num >= 1 && num <= 2118) return num;
  return null;
}

export interface HighlightSegment {
  text: string;
  matched: boolean;
}

function charToPattern(ch: string): string {
  if (ch === 'ی') return '[يیىئ]';
  if (ch === 'ک') return '[كک]';
  if (ch === 'ا') return '[اأإآٱ]';
  if (ch === 'و') return '[وؤؤ]';
  if (ch === 'ه') return '[ههٔةۀھ]';
  if (/\d/.test(ch)) {
    const d = Number(ch);
    const p = PERSIAN_DIGITS[d];
    const a = String.fromCharCode(0x0660 + d);
    return `[${ch}${p}${a}]`;
  }
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DIACRITICS_OPT = '[\u064B-\u065F\u0670\u0640\u200c]*';

function wordToPattern(word: string): string {
  return word.split('').map(charToPattern).join(DIACRITICS_OPT);
}

/**
 * Splits display text into highlighted/plain segments matching query tokens
 * and their Persian plural/morphological equivalents (e.g. پرنده -> پرندگان).
 */
export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  if (!text || !query.trim()) {
    return [{text, matched: false}];
  }
  const tokens = tokenizePersian(query).filter(t => t.length >= 2);
  if (tokens.length === 0) {
    return [{text, matched: false}];
  }

  const expandedForms: string[] = [];
  for (const tok of tokens) {
    const forms = new Set<string>([tok]);
    if (tok.endsWith('ه') && tok.length >= 3) {
      const stem = tok.slice(0, -1);
      forms.add(`${stem}گان`);
      forms.add(`${stem}گانی`);
      forms.add(`${tok}ها`);
      forms.add(`${tok}های`);
      forms.add(`${tok}هایی`);
      forms.add(`${tok}ای`);
    } else if (tok.endsWith('گان') && tok.length >= 5) {
      forms.add(`${tok.slice(0, -3)}ه`);
    } else {
      for (const lemma of getPersianLemmas(tok)) {
        if (!lemma.includes('#')) {
          forms.add(lemma);
          forms.add(`${lemma}ها`);
          forms.add(`${lemma}های`);
          forms.add(`${lemma}ان`);
          forms.add(`${lemma}ات`);
        }
      }
    }
    // Sort longer forms first so regex matches full inflected words (e.g. پرندگان) instead of partial prefix
    const sorted = [...forms].sort((a, b) => b.length - a.length);
    expandedForms.push(...sorted);
  }

  const patterns = expandedForms.map(wordToPattern);
  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({text: text.slice(lastIndex, m.index), matched: false});
    }
    segments.push({text: m[0], matched: true});
    lastIndex = m.index + m[0].length;
    if (m[0].length === 0) break;
  }
  if (lastIndex < text.length) {
    segments.push({text: text.slice(lastIndex), matched: false});
  }
  return segments.length > 0 ? segments : [{text, matched: false}];
}

const RULING_PATTERNS: Record<Exclude<RulingFilter, 'all'>, RegExp> = {
  ehtiyat: /احتیاط واجب|علی الاحوط|بنابر احتیاط|احتیاط آن است/,
  haram: /حرام است|جایز نیست|جائز نیست|حرام می باشد|وجه شرعی ندارد/,
  jayez: /جایز است|اشکال ندارد|مانعی ندارد|حلال است|صحیح است/,
  batil: /باطل است|موجب بطلان|محکوم به بطلان|صحیح نیست/,
  wajib: /واجب است|لازم است|بر او واجب|تکلیف او/,
  kaffarah: /کفاره|قضای آن|قضا نماید|جبران/,
};

export function matchesRulingFilter(answerText: string, filter: RulingFilter): boolean {
  if (filter === 'all') return true;
  const norm = normalizePersian(answerText);
  return RULING_PATTERNS[filter].test(norm);
}

export function detectRulingLabels(answerText: string): string[] {
  const norm = normalizePersian(answerText);
  const labels: string[] = [];
  if (RULING_PATTERNS.ehtiyat.test(norm)) labels.push('احتیاط واجب');
  if (RULING_PATTERNS.haram.test(norm)) labels.push('منع / حرمت');
  if (RULING_PATTERNS.batil.test(norm)) labels.push('حکم بطلان');
  if (RULING_PATTERNS.kaffarah.test(norm)) labels.push('قضا / کفاره');
  if (labels.length === 0 && RULING_PATTERNS.jayez.test(norm)) labels.push('جواز / صحت');
  return labels.slice(0, 2);
}
