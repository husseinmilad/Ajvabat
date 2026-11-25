import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  detectRulingLabels,
  getPersianLemmas,
  matchesRulingFilter,
  normalizePersian,
  parseQuestionNumberQuery,
  splitHighlightSegments,
  toAsciiDigits,
  toPersianDigits,
} from './persian.ts';

describe('Persian & Arabic text utilities', () => {
  it('converts Persian and Arabic-Indic digits to ASCII and back', () => {
    assert.equal(toAsciiDigits('سؤال ۴۵۸ و ١٢٣'), 'سؤال 458 و 123');
    assert.equal(toPersianDigits(2118), '۲۱۱۸');
  });

  it('normalizes Arabic yeh, kaf, alef, and heh variants consistently', () => {
    assert.equal(normalizePersian('مَسْأَلَةُ التَّقْلِيدِ فِي الإسلام'), 'مساله التقلید فی الاسلام');
    assert.equal(normalizePersian('يحيى كاتب كتابي'), 'یحیی کاتب کتابی');
    assert.equal(normalizePersian('وضو‌گیری با آبِ کرّ'), 'وضوگیری با اب کر');
    assert.equal(normalizePersian('خانۀ پرندهٔ'), 'خانه پرنده');
  });

  it('links Persian -ه nouns with -گان plurals without mangling unrelated stems', () => {
    const singularLemmas = getPersianLemmas('پرنده');
    const pluralLemmas = getPersianLemmas('پرندگان');
    const unrelatedVerbLemmas = getPersianLemmas('بپرند');

    assert.ok(singularLemmas.some(l => pluralLemmas.includes(l)));
    assert.ok(!singularLemmas.some(l => unrelatedVerbLemmas.includes(l)));
  });

  it('parses question number queries in Persian and English formats', () => {
    assert.equal(parseQuestionNumberQuery('458'), 458);
    assert.equal(parseQuestionNumberQuery('س ۴۵۸'), 458);
    assert.equal(parseQuestionNumberQuery('سؤال ۱۲.'), 12);
    assert.equal(parseQuestionNumberQuery('#2118'), 2118);
    assert.equal(parseQuestionNumberQuery('2119'), null);
    assert.equal(parseQuestionNumberQuery('حکم نماز مسافر'), null);
  });

  it('splits highlight segments across Arabic variants and Persian plurals', () => {
    const segments = splitHighlightSegments('آیا تقلید از مجتهد أعلم واجب است؟', 'اعلم');
    const matched = segments.filter(s => s.matched).map(s => s.text);
    assert.deepEqual(matched, ['أعلم']);

    const birdSegments = splitHighlightSegments('آیا فضله پرندگان حرام گوشت نجس است؟', 'پرنده');
    const birdMatched = birdSegments.filter(s => s.matched).map(s => s.text);
    assert.deepEqual(birdMatched, ['پرندگان']);
  });

  it('detects ruling filters accurately', () => {
    assert.equal(matchesRulingFilter('بنابر احتیاط واجب باید قضا نماید.', 'ehtiyat'), true);
    assert.equal(matchesRulingFilter('در فرض سؤال اشکال ندارد و صحیح است.', 'jayez'), true);
    assert.equal(matchesRulingFilter('این کار شرعا حرام است و جایز نیست.', 'haram'), true);
    assert.deepEqual(detectRulingLabels('بنابر احتیاط واجب روزه اش باطل است.'), [
      'احتیاط واجب',
      'حکم بطلان',
    ]);
  });
});
