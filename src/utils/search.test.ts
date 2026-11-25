import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type {BookDataset, IstiftaItem, SearchOptions} from '../types/book.ts';
import {buildSearchIndex, searchQuestions} from './search.ts';
import {buildBackupPayload, parseBackupPayload} from './storage.ts';
import {buildFormattedShareText} from './share.ts';

const SAMPLE_QUESTIONS: IstiftaItem[] = [
  {
    id: 1,
    page: 6,
    chapterId: 'taqlid',
    subtopicId: 'taqlid-1',
    question: 'آیا تقلید، صرفاً یک مسأله عقلی است یا ادلّه شرعی نیز دارد؟',
    answer: 'تقلید، ادلّه شرعی دارد و شخص ناآگاه باید به مجتهد جامع‌الشرایط مراجعه کند.',
    footnotes: [],
  },
  {
    id: 194,
    page: 45,
    chapterId: 'taharat',
    subtopicId: 'taharat-5',
    question: 'کسی که جاهل به وجوب غسل بوده چه حکمی دارد؟',
    answer: 'بنابر احتیاط واجب روزه اش باطل است و باید قضای آن را بگیرد.',
    footnotes: ['[۱]. مواردی که بنابر احتیاط واجب روزه باطل است...'],
  },
  {
    id: 458,
    page: 102,
    chapterId: 'namaz',
    subtopicId: 'namaz-10',
    question: 'قرائت حمد و سوره در نمازهای یومیه چگونه است؟',
    answer: 'در رکعت اول و دوم قرائت واجب است و در رکعت سوم تسبیحات اربعه کفایت می‌کند.',
    footnotes: [],
  },
  {
    id: 279,
    page: 62,
    chapterId: 'taharat',
    subtopicId: 'taharat-8',
    question: 'آیا فضله پرندگان حرام گوشت نجس است؟',
    answer: 'فضله پرندگان حرام گوشت نجس نیست.',
    footnotes: [],
  },
  {
    id: 999,
    page: 210,
    chapterId: 'moamelat',
    subtopicId: 'moamelat-1',
    question: 'اگر دو پرنده خانگی داشته باشیم چه حکمی دارد؟',
    answer: 'در نگهداری پرنده مانعی نیست.',
    footnotes: [],
  },
];

const DEFAULT_OPTS: SearchOptions = {
  query: '',
  matchMode: 'all',
  scope: 'both',
  chapterIds: [],
  subtopicId: null,
  ruling: 'all',
};

describe('Search engine & dataset integrity', () => {
  const index = buildSearchIndex(SAMPLE_QUESTIONS);

  it('finds direct question numbers regardless of Persian/Arabic digits', () => {
    const res = searchQuestions(index, {...DEFAULT_OPTS, query: 'س ۴۵۸'});
    assert.equal(res.directQuestionMatch, 458);
    assert.equal(res.items[0]?.id, 458);
  });

  it('matches Persian singular/plural pairs (پرنده <-> پرندگان) and prioritizes exact whole-word matches', () => {
    const res = searchQuestions(index, {...DEFAULT_OPTS, query: 'پرنده'});
    assert.deepEqual(
      res.items.map(i => i.id),
      [999, 279],
    );
    assert.equal(res.usedMorphologicalMatch, true);
  });

  it('avoids false mid-word substring matches when searching whole words', () => {
    const res = searchQuestions(index, {...DEFAULT_OPTS, query: 'دار'});
    // "ندارد" or "دارد" should NOT match whole word "دار"
    assert.equal(res.items.length, 0);
  });

  it('respects AND (all), OR (any), and exact match modes', () => {
    const allRes = searchQuestions(index, {
      ...DEFAULT_OPTS,
      query: 'تقلید مجتهد',
      matchMode: 'all',
    });
    assert.equal(allRes.items.length, 1);

    const anyRes = searchQuestions(index, {
      ...DEFAULT_OPTS,
      query: 'تقلید قرائت',
      matchMode: 'any',
    });
    assert.equal(anyRes.items.length, 2);

    const exactRes = searchQuestions(index, {
      ...DEFAULT_OPTS,
      query: 'تسبیحات اربعه',
      matchMode: 'exact',
    });
    assert.equal(exactRes.items.length, 1);
    assert.equal(exactRes.items[0].id, 458);
  });

  it('filters by scope (question vs answer) and ruling type', () => {
    const qOnly = searchQuestions(index, {
      ...DEFAULT_OPTS,
      query: 'تسبیحات',
      scope: 'question',
    });
    assert.equal(qOnly.items.length, 0);

    const aOnly = searchQuestions(index, {
      ...DEFAULT_OPTS,
      query: 'تسبیحات',
      scope: 'answer',
    });
    assert.equal(aOnly.items.length, 1);

    const rulingRes = searchQuestions(index, {
      ...DEFAULT_OPTS,
      ruling: 'ehtiyat',
    });
    assert.deepEqual(
      rulingRes.items.map(i => i.id),
      [194],
    );
  });

  it('validates backup export and import round-trip', () => {
    const payload = buildBackupPayload(
      [{questionId: 458, important: true, category: 'عبادات', createdAt: '2026-01-01T00:00:00Z'}],
      [{questionId: 194, text: 'نکته مهم برای نماز و روزه', updatedAt: '2026-01-01T00:00:00Z'}],
      ['namaz-10'],
    );
    const restored = parseBackupPayload(JSON.stringify(payload));
    assert.equal(restored.bookmarks.length, 1);
    assert.equal(restored.notes.length, 1);
    assert.deepEqual(restored.bookmarkedSubtopics, ['namaz-10']);
  });

  it('verifies full extracted ajwibah.json dataset has all 2118 Q&As intact and finds پرندگان for پرنده', () => {
    const datasetPath = path.resolve(process.cwd(), 'public/data/ajwibah.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as BookDataset;
    assert.equal(dataset.questions.length, 2118);
    assert.equal(dataset.chapters.length, 12);
    const fullIndex = buildSearchIndex(dataset.questions);

    const khomsResult = searchQuestions(fullIndex, {
      ...DEFAULT_OPTS,
      query: 'خمس مؤونه',
      chapterIds: ['khoms'],
    });
    assert.ok(khomsResult.items.length > 5);

    const birdResult = searchQuestions(fullIndex, {
      ...DEFAULT_OPTS,
      query: 'پرنده',
    });
    assert.ok(birdResult.items.some(q => q.id === 279));
    assert.ok(birdResult.items.some(q => q.id === 280));
  });

  it('formats share text cleanly without embedding links', () => {
    const text = buildFormattedShareText(
      SAMPLE_QUESTIONS[2],
      'احکام نماز',
      'قرائت و احکام آن',
      'نکته شخصی',
    );
    assert.ok(text.includes('۴۵۸'));
    assert.ok(text.includes('نکته شخصی'));
    assert.ok(!text.includes('http'));
    assert.ok(!text.includes('?q='));
  });
});
