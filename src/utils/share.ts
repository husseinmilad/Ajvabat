import type {IstiftaItem} from '../types/book.ts';
import {toPersianDigits} from './persian.ts';

export function buildFormattedShareText(
  item: IstiftaItem,
  chapterTitle: string,
  subtopicTitle: string,
  personalNote?: string,
): string {
  const qNum = toPersianDigits(item.id);
  const pageNum = toPersianDigits(item.page);
  const lines = [
    `📖 استفتاء شماره ${qNum} — اجوبة‌الاستفتائات`,
    `باب: ${chapterTitle} (${subtopicTitle}) · صفحه ${pageNum}`,
    '',
    `سؤال: ${item.question}`,
    '',
    `پاسخ: ${item.answer}`,
  ];

  if (personalNote && personalNote.trim()) {
    lines.push('', `📝 یادداشت شخصی: ${personalNote.trim()}`);
  }

  lines.push(
    '',
    'منبع: کتاب اجوبة‌الاستفتائات شهید آیت‌الله سید علی خامنه‌ای (قدس‌الله‌نفسه‌الزکیه)',
  );

  return lines.join('\n');
}
