import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  detectRulingLabels,
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

  it('normalizes Arabic yeh, kaf, alef variants, and diacritics consistently', () => {
    assert.equal(normalizePersian('مَسْأَلَةُ التَّقْلِيدِ فِي الإسلام'), 'مساله التقلید فی الاسلام');
    assert.equal(normalizePersian('يحيى كاتب كتابي'), 'یحیی کاتب کتابی');
    assert.equal(normalizePersian('وضو‌گیری با آبِ کرّ'), 'وضوگیری با اب کر');
  });

  it('parses question number queries in Persian and English formats', () => {
    assert.equal(parseQuestionNumberQuery('458'), 458);
    assert.equal(parseQuestionNumberQuery('س ۴۵۸'), 458);
    assert.equal(parseQuestionNumberQuery('سؤال ۱۲.'), 12);
    assert.equal(parseQuestionNumberQuery('#2118'), 2118);
    assert.equal(parseQuestionNumberQuery('2119'), null);
    assert.equal(parseQuestionNumberQuery('حکم نماز مسافر'), null);
  });

  it('splits highlight segments across Arabic/Persian character variants', () => {
    const segments = splitHighlightSegments('آیا تقلید از مجتهد أعلم واجب است؟', 'اعلم');
    const matched = segments.filter(s => s.matched).map(s => s.text);
    assert.deepEqual(matched, ['أعلم']);
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
