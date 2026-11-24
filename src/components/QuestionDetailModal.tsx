import React, {useEffect, useState} from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Star,
  Share2,
  StickyNote,
  Trash2,
} from 'lucide-react';
import type {
  BookmarkEntry,
  FontScale,
  IstiftaItem,
  NoteEntry,
} from '../types/book.ts';
import {toPersianDigits} from '../utils/persian.ts';

interface QuestionDetailModalProps {
  item: IstiftaItem | null;
  chapterTitle: string;
  subtopicTitle: string;
  fontScale: FontScale;
  bookmark?: BookmarkEntry;
  note?: NoteEntry;
  onClose: () => void;
  onNavigate: (questionId: number) => void;
  onToggleBookmark: (questionId: number) => void;
  onUpdateBookmark: (questionId: number, patch: Partial<BookmarkEntry>) => void;
  onSaveNote: (questionId: number, text: string) => void;
  onDeleteNote: (questionId: number) => void;
  onOpenShare: (item: IstiftaItem) => void;
}

export function QuestionDetailModal({
  item,
  chapterTitle,
  subtopicTitle,
  fontScale,
  bookmark,
  note,
  onClose,
  onNavigate,
  onToggleBookmark,
  onUpdateBookmark,
  onSaveNote,
  onDeleteNote,
  onOpenShare,
}: QuestionDetailModalProps) {
  const [noteDraft, setNoteDraft] = useState(note?.text || '');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setNoteDraft(note?.text || '');
  }, [item?.id, note?.text]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const textSizeClass =
    fontScale === 'xl'
      ? 'text-xl leading-10'
      : fontScale === 'lg'
        ? 'text-lg leading-9'
        : fontScale === 'sm'
          ? 'text-sm leading-7'
          : 'text-base leading-8';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraft.trim()) {
      onDeleteNote(item.id);
    } else {
      onSaveNote(item.id, noteDraft.trim());
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E2D9C8] dark:border-[#2D333A] flex items-center justify-between gap-3 bg-[#F8F5EE] dark:bg-[#22272C]">
          <div className="min-w-0">
            <div className="text-xs text-[#57534E] dark:text-[#A8A29E] truncate tabular-nums">
              {chapterTitle} · {subtopicTitle} · صفحه {toPersianDigits(item.page)}
            </div>
            <h2
              id="detail-modal-title"
              className="text-base font-bold text-[#0F4C46] dark:text-[#2DD4BF] tabular-nums"
            >
              استفتاء شماره {toPersianDigits(item.id)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره مطالعه"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F4EFE6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="font-editorial font-bold text-xl text-[#9A6B25] dark:text-[#D4AF37] shrink-0">
                س:
              </span>
              <p className={`font-semibold text-[#1C1917] dark:text-[#F4EFE6] whitespace-pre-line ${textSizeClass}`}>
                {item.question}
              </p>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-dashed border-[#E2D9C8] dark:border-[#2D333A]">
              <span className="font-editorial font-bold text-xl text-[#0F4C46] dark:text-[#2DD4BF] shrink-0">
                ج:
              </span>
              <p className={`text-[#292524] dark:text-[#E7E5E4] whitespace-pre-line ${textSizeClass}`}>
                {item.answer}
              </p>
            </div>

            {item.footnotes.length > 0 && (
              <div className="p-3.5 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] text-xs leading-6 text-[#57534E] dark:text-[#D6D3D1] space-y-1">
                <div className="font-semibold text-[#1C1917] dark:text-[#F4EFE6]">پاورقی:</div>
                {item.footnotes.map((fn, i) => (
                  <p key={i}>{fn}</p>
                ))}
              </div>
            )}
          </div>

          {/* Personal Note Editor */}
          <form
            onSubmit={handleSave}
            className="p-4 bg-[#F8F5EE] dark:bg-[#22272C] border border-[#E2D9C8] dark:border-[#2D333A] rounded-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="modal-note-textarea"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1917] dark:text-[#F4EFE6]"
              >
                <StickyNote className="w-4 h-4 text-[#9A6B25] dark:text-[#D4AF37]" />
                <span>یادداشت شخصی</span>
              </label>
              {savedNotice && (
                <span className="text-xs text-[#0F4C46] dark:text-[#2DD4BF] font-medium">
                  یادداشت ذخیره شد
                </span>
              )}
            </div>
            <textarea
              id="modal-note-textarea"
              rows={3}
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="یادداشت، نکته تطبیقی یا حاشیه شخصی خود را برای این استفتاء ثبت کنید..."
              className="w-full p-2.5 text-xs leading-6 bg-[#FFFDF8] dark:bg-[#111315] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] placeholder:text-[#78716C] focus:outline-none focus:border-[#0F4C46] dark:focus:border-[#2DD4BF]"
            />
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
              >
                ذخیره یادداشت
              </button>
              {note && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteNote(item.id);
                    setNoteDraft('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#9A3412] dark:text-[#FCA5A5] hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف یادداشت</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer Navigation & Actions */}
        <div className="px-5 py-3 border-t border-[#E2D9C8] dark:border-[#2D333A] bg-[#F8F5EE] dark:bg-[#22272C] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={item.id <= 1}
              onClick={() => onNavigate(item.id - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>سؤال قبلی</span>
            </button>
            <button
              type="button"
              disabled={item.id >= 2118}
              onClick={() => onNavigate(item.id + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md disabled:opacity-40 cursor-pointer"
            >
              <span>سؤال بعدی</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border cursor-pointer ${
                bookmark
                  ? 'bg-[#9A6B25]/15 border-[#9A6B25] text-[#9A6B25] dark:text-[#D4AF37] font-medium'
                  : 'bg-[#FFFDF8] dark:bg-[#191D21] border-[#D6CEBE] dark:border-[#2D333A] text-[#1C1917] dark:text-[#F4EFE6]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={bookmark ? 'currentColor' : 'none'} />
              <span>{bookmark ? 'نشان‌شده' : 'نشان‌گذاری'}</span>
            </button>

            {bookmark && (
              <button
                type="button"
                onClick={() => onUpdateBookmark(item.id, {important: !bookmark.important})}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border cursor-pointer ${
                  bookmark.important
                    ? 'bg-[#9A6B25] text-white border-[#9A6B25]'
                    : 'bg-[#FFFDF8] dark:bg-[#191D21] border-[#D6CEBE] dark:border-[#2D333A]'
                }`}
              >
                <Star className="w-3.5 h-3.5" fill={bookmark.important ? 'currentColor' : 'none'} />
                <span>مهم</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenShare(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
