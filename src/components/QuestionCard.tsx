import React, {useState} from 'react';
import {
  Bookmark,
  Star,
  StickyNote,
  Share2,
  Copy,
  Check,
  Maximize2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  BookmarkEntry,
  FontScale,
  IstiftaItem,
  NoteEntry,
} from '../types/book.ts';
import {HighlightedText} from './HighlightedText.tsx';
import {detectRulingLabels, toPersianDigits} from '../utils/persian.ts';

interface QuestionCardProps {
  item: IstiftaItem;
  chapterTitle: string;
  subtopicTitle: string;
  highlightQuery: string;
  fontScale: FontScale;
  bookmark?: BookmarkEntry;
  note?: NoteEntry;
  onToggleBookmark: (questionId: number) => void;
  onUpdateBookmark: (questionId: number, patch: Partial<BookmarkEntry>) => void;
  onSaveNote: (questionId: number, text: string) => void;
  onDeleteNote: (questionId: number) => void;
  onOpenShare: (item: IstiftaItem) => void;
  onOpenDetail: (item: IstiftaItem) => void;
}

const FONT_CLASSES: Record<FontScale, {q: string; a: string}> = {
  sm: {q: 'text-sm leading-7', a: 'text-[13.5px] leading-7'},
  md: {q: 'text-[15.5px] leading-8', a: 'text-[15px] leading-8'},
  lg: {q: 'text-lg leading-9', a: 'text-[17px] leading-9'},
  xl: {q: 'text-xl leading-10', a: 'text-[19px] leading-10'},
};

const BOOKMARK_CATEGORIES = ['عمومی', 'عبادات', 'مالی و خمس', 'خانواده و اجتماعی', 'پزشکی و رسانه'];

export function QuestionCard({
  item,
  chapterTitle,
  subtopicTitle,
  highlightQuery,
  fontScale,
  bookmark,
  note,
  onToggleBookmark,
  onUpdateBookmark,
  onSaveNote,
  onDeleteNote,
  onOpenShare,
  onOpenDetail,
}: QuestionCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note?.text || '');
  const [copied, setCopied] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(true);

  React.useEffect(() => {
    setNoteDraft(note?.text || '');
  }, [note?.text]);

  const rulingLabels = React.useMemo(() => detectRulingLabels(item.answer), [item.answer]);
  const scale = FONT_CLASSES[fontScale];

  const handleCopy = async () => {
    const text = `سؤال ${toPersianDigits(item.id)} (${chapterTitle} - ${subtopicTitle}، ص ${toPersianDigits(item.page)}):\n${item.question}\n\nپاسخ:\n${item.answer}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraft.trim()) {
      onDeleteNote(item.id);
    } else {
      onSaveNote(item.id, noteDraft.trim());
    }
    setNoteOpen(false);
  };

  return (
    <article
      id={`question-${item.id}`}
      className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-5 sm:p-6 transition-colors hover:border-[#C9BEA8] dark:hover:border-[#3F464F]"
    >
      {/* Clean Typographic Metadata Header (Zero Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#E2D9C8]/80 dark:border-[#2D333A]/80">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
          <span className="font-bold text-sm text-[#0F4C46] dark:text-[#2DD4BF]">
            سؤال {toPersianDigits(item.id)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-[#1C1917] dark:text-[#F4EFE6]">{chapterTitle}</span>
          <span aria-hidden="true">/</span>
          <span>{subtopicTitle}</span>
          <span aria-hidden="true">·</span>
          <span>صفحه {toPersianDigits(item.page)}</span>
          {rulingLabels.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#9A6B25] dark:text-[#D4AF37] font-medium">
                {rulingLabels.join(' · ')}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(item)}
          aria-label={`مطالعه متمرکز سؤال ${toPersianDigits(item.id)}`}
          title="نمای مطالعه متمرکز"
          className="inline-flex items-center gap-1 text-xs text-[#57534E] hover:text-[#0F4C46] dark:text-[#A8A29E] dark:hover:text-[#2DD4BF] cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">نمای مطالعه</span>
        </button>
      </div>

      {/* Question Body */}
      <div className="space-y-4">
        <div className="flex items-start gap-2.5">
          <span className="font-editorial font-bold text-[#9A6B25] dark:text-[#D4AF37] text-lg shrink-0 mt-0.5 select-none">
            س:
          </span>
          <h3 className={`font-semibold text-[#1C1917] dark:text-[#F4EFE6] whitespace-pre-line ${scale.q}`}>
            <HighlightedText text={item.question} query={highlightQuery} />
          </h3>
        </div>

        {/* Answer Body */}
        <div className="flex items-start gap-2.5 pt-3 border-t border-dashed border-[#E2D9C8] dark:border-[#2D333A]">
          <span className="font-editorial font-bold text-[#0F4C46] dark:text-[#2DD4BF] text-lg shrink-0 mt-0.5 select-none">
            ج:
          </span>
          <div className={`text-[#292524] dark:text-[#E7E5E4] whitespace-pre-line flex-1 ${scale.a}`}>
            <HighlightedText text={item.answer} query={highlightQuery} />
          </div>
        </div>

        {/* Footnotes if present */}
        {item.footnotes.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowFootnotes(v => !v)}
              className="inline-flex items-center gap-1 text-xs text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F4EFE6] cursor-pointer"
            >
              <span>پاورقی ({toPersianDigits(item.footnotes.length)})</span>
              {showFootnotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showFootnotes && (
              <div className="mt-2 p-3 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] text-xs leading-6 text-[#57534E] dark:text-[#D6D3D1] space-y-1">
                {item.footnotes.map((fn, idx) => (
                  <p key={idx}>
                    <HighlightedText text={fn} query={highlightQuery} />
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved Personal Note Preview (when editor is closed) */}
      {note && !noteOpen && (
        <div className="mt-4 p-3 bg-[#F8F5EE] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-semibold text-[#9A6B25] dark:text-[#D4AF37] flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              <span>یادداشت شخصی شما</span>
            </div>
            <p className="text-xs leading-6 text-[#292524] dark:text-[#E7E5E4] whitespace-pre-line">
              {note.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="text-xs text-[#0F4C46] dark:text-[#2DD4BF] hover:underline shrink-0 cursor-pointer"
          >
            ویرایش
          </button>
        </div>
      )}

      {/* Inline Personal Note Editor */}
      {noteOpen && (
        <form
          onSubmit={handleSaveNote}
          className="mt-4 p-3.5 bg-[#F8F5EE] dark:bg-[#22272C] border border-[#0F4C46]/40 dark:border-[#2DD4BF]/40 rounded-md space-y-2.5"
        >
          <label
            htmlFor={`note-input-${item.id}`}
            className="block text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]"
          >
            یادداشت شخصی برای استفتاء {toPersianDigits(item.id)}
          </label>
          <textarea
            id={`note-input-${item.id}`}
            rows={3}
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            placeholder="نکات فقهی، تطبیق با شرایط شخصی یا ارجاعات خود را اینجا بنویسید..."
            className="w-full p-2.5 text-xs leading-6 bg-[#FFFDF8] dark:bg-[#111315] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] placeholder:text-[#78716C] focus:outline-none focus:border-[#0F4C46] dark:focus:border-[#2DD4BF]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
              >
                ذخیره یادداشت
              </button>
              <button
                type="button"
                onClick={() => {
                  setNoteDraft(note?.text || '');
                  setNoteOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] cursor-pointer"
              >
                انصراف
              </button>
            </div>
            {note && (
              <button
                type="button"
                onClick={() => {
                  onDeleteNote(item.id);
                  setNoteDraft('');
                  setNoteOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs text-[#9A3412] dark:text-[#FCA5A5] hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف یادداشت</span>
              </button>
            )}
          </div>
        </form>
      )}

      {/* Bookmark Category Selector (shown when bookmarked) */}
      {bookmark && (
        <div className="mt-3 pt-2.5 border-t border-[#E2D9C8]/60 dark:border-[#2D333A]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#78716C] dark:text-[#A8A29E]">دسته‌بندی:</span>
            {BOOKMARK_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => onUpdateBookmark(item.id, {category: cat})}
                className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer transition-colors ${
                  bookmark.category === cat
                    ? 'bg-[#0F4C46]/12 dark:bg-[#2DD4BF]/15 border-[#0F4C46] dark:border-[#2DD4BF] text-[#0F4C46] dark:text-[#2DD4BF] font-medium'
                    : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onUpdateBookmark(item.id, {important: !bookmark.important})}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] cursor-pointer transition-colors ${
              bookmark.important
                ? 'bg-[#9A6B25]/15 border-[#9A6B25] text-[#9A6B25] dark:text-[#D4AF37] font-semibold'
                : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <Star className="w-3 h-3" fill={bookmark.important ? 'currentColor' : 'none'} />
            <span>{bookmark.important ? 'مبحث بسیار مهم' : 'علامت به عنوان مهم'}</span>
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-4 pt-3 border-t border-[#E2D9C8]/80 dark:border-[#2D333A]/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onToggleBookmark(item.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
              bookmark
                ? 'bg-[#9A6B25]/12 border-[#9A6B25]/50 text-[#9A6B25] dark:text-[#D4AF37] font-medium'
                : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={bookmark ? 'currentColor' : 'none'} />
            <span>{bookmark ? 'نشان‌شده' : 'نشان‌گذاری'}</span>
          </button>

          <button
            type="button"
            onClick={() => setNoteOpen(v => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
              note || noteOpen
                ? 'bg-[#0F4C46]/10 border-[#0F4C46]/40 text-[#0F4C46] dark:text-[#2DD4BF] font-medium'
                : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46]'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>{note ? 'ویرایش یادداشت' : 'یادداشت شخصی'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0F4C46] dark:text-[#2DD4BF]" />
                <span className="text-[#0F4C46] dark:text-[#2DD4BF]">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenShare(item)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>اشتراک‌گذاری</span>
          </button>
        </div>
      </div>
    </article>
  );
}
