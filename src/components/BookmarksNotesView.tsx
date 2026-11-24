import React, {useRef, useState} from 'react';
import {
  Bookmark,
  Star,
  StickyNote,
  Download,
  Upload,
  Search,
  BookOpen,
} from 'lucide-react';
import type {
  BookmarkEntry,
  Chapter,
  FontScale,
  IstiftaItem,
  NoteEntry,
  Subtopic,
  UserDataBackup,
} from '../types/book.ts';
import {QuestionCard} from './QuestionCard.tsx';
import {buildBackupPayload, parseBackupPayload} from '../utils/storage.ts';
import {normalizePersian, toPersianDigits} from '../utils/persian.ts';

interface BookmarksNotesViewProps {
  questionsById: Map<number, IstiftaItem>;
  chaptersById: Map<string, Chapter>;
  subtopicsById: Map<string, Subtopic>;
  bookmarks: BookmarkEntry[];
  notes: NoteEntry[];
  bookmarkedSubtopics: string[];
  fontScale: FontScale;
  onToggleBookmark: (questionId: number) => void;
  onUpdateBookmark: (questionId: number, patch: Partial<BookmarkEntry>) => void;
  onSaveNote: (questionId: number, text: string) => void;
  onDeleteNote: (questionId: number) => void;
  onOpenShare: (item: IstiftaItem) => void;
  onOpenDetail: (item: IstiftaItem) => void;
  onSelectSubtopicFromSaved: (chapterId: string, subtopicId: string) => void;
  onToggleBookmarkSubtopic: (subtopicId: string) => void;
  onImportBackup: (data: UserDataBackup) => void;
}

type SavedFilterTab = 'all' | 'important' | 'notes' | 'subtopics';

export function BookmarksNotesView({
  questionsById,
  chaptersById,
  subtopicsById,
  bookmarks,
  notes,
  bookmarkedSubtopics,
  fontScale,
  onToggleBookmark,
  onUpdateBookmark,
  onSaveNote,
  onDeleteNote,
  onOpenShare,
  onOpenDetail,
  onSelectSubtopicFromSaved,
  onToggleBookmarkSubtopic,
  onImportBackup,
}: BookmarksNotesViewProps) {
  const [tab, setTab] = useState<SavedFilterTab>('all');
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [statusMessage, setStatusMessage] = useState<{type: 'ok' | 'err'; text: string} | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bookmarkMap = React.useMemo(() => {
    const m = new Map<number, BookmarkEntry>();
    for (const b of bookmarks) m.set(b.questionId, b);
    return m;
  }, [bookmarks]);

  const noteMap = React.useMemo(() => {
    const m = new Map<number, NoteEntry>();
    for (const n of notes) m.set(n.questionId, n);
    return m;
  }, [notes]);

  const categories = React.useMemo(() => {
    const set = new Set<string>(['همه']);
    for (const b of bookmarks) set.add(b.category);
    return [...set];
  }, [bookmarks]);

  const savedQuestionIds = React.useMemo(() => {
    const ids = new Set<number>();
    if (tab === 'all') {
      for (const b of bookmarks) ids.add(b.questionId);
      for (const n of notes) ids.add(n.questionId);
    } else if (tab === 'important') {
      for (const b of bookmarks) {
        if (b.important) ids.add(b.questionId);
      }
    } else if (tab === 'notes') {
      for (const n of notes) ids.add(n.questionId);
    }
    return [...ids].sort((a, b) => a - b);
  }, [tab, bookmarks, notes]);

  const filteredQuestions = React.useMemo(() => {
    const normFilter = normalizePersian(filterText);
    return savedQuestionIds
      .map(id => questionsById.get(id))
      .filter((q): q is IstiftaItem => {
        if (!q) return false;
        const bm = bookmarkMap.get(q.id);
        if (selectedCategory !== 'همه' && (!bm || bm.category !== selectedCategory)) {
          return false;
        }
        if (!normFilter) return true;
        const noteText = noteMap.get(q.id)?.text || '';
        const haystack = normalizePersian(`${q.question} ${q.answer} ${noteText}`);
        return haystack.includes(normFilter) || String(q.id).includes(normFilter);
      });
  }, [savedQuestionIds, questionsById, bookmarkMap, noteMap, selectedCategory, filterText]);

  const handleExport = () => {
    const payload = buildBackupPayload(bookmarks, notes, bookmarkedSubtopics);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ajwibah-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({type: 'ok', text: 'فایل پشتیبان نشانه‌ها و یادداشت‌ها با موفقیت ذخیره شد.'});
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const txt = await file.text();
      const parsed = parseBackupPayload(txt);
      onImportBackup(parsed);
      setStatusMessage({
        type: 'ok',
        text: `${toPersianDigits(parsed.bookmarks.length)} نشانه‌گذاری و ${toPersianDigits(parsed.notes.length)} یادداشت با موفقیت بازیابی شد.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'خطا در خواندن فایل پشتیبان.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const importantCount = bookmarks.filter(b => b.important).length;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Backup Controls */}
      <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F4EFE6]">
              نشان‌شده‌ها، مباحث مهم و یادداشت‌های شخصی
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1 tabular-nums">
              {toPersianDigits(bookmarks.length)} استفتاء نشان‌شده ·{' '}
              {toPersianDigits(importantCount)} مورد بسیار مهم ·{' '}
              {toPersianDigits(notes.length)} یادداشت شخصی ·{' '}
              {toPersianDigits(bookmarkedSubtopics.length)} مبحث منتخب
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دریافت پشتیبان</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#F8F5EE] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] text-[#1C1917] dark:text-[#F4EFE6] rounded-md cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>بازیابی پشتیبان</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-md text-xs border ${
              statusMessage.type === 'ok'
                ? 'bg-[#0F4C46]/10 border-[#0F4C46]/30 text-[#0F4C46] dark:text-[#2DD4BF]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#9A3412]'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2D9C8] dark:border-[#2D333A]">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                {id: 'all', label: 'همه موارد', icon: Bookmark},
                {id: 'important', label: `مباحث مهم (${toPersianDigits(importantCount)})`, icon: Star},
                {id: 'notes', label: `یادداشت‌ها (${toPersianDigits(notes.length)})`, icon: StickyNote},
                {
                  id: 'subtopics',
                  label: `مباحث منتخب (${toPersianDigits(bookmarkedSubtopics.length)})`,
                  icon: BookOpen,
                },
              ] as const
            ).map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-colors tabular-nums ${
                    active
                      ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF] font-medium'
                      : 'border-[#D6CEBE] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {tab !== 'subtopics' && (
            <div className="relative w-full sm:w-64">
              <label htmlFor="saved-filter-input" className="sr-only">
                جستجو در نشانه‌ها و یادداشت‌ها
              </label>
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="saved-filter-input"
                type="search"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="جستجو در یادداشت‌ها..."
                className="w-full pr-8 pl-3 py-1.5 text-xs bg-[#F8F5EE] dark:bg-[#111315] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6]"
              />
            </div>
          )}
        </div>

        {/* Category Filter */}
        {tab !== 'subtopics' && categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">دسته‌بندی:</span>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#9A6B25]/15 border-[#9A6B25] text-[#9A6B25] dark:text-[#D4AF37] font-medium'
                    : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Saved Subtopics View */}
      {tab === 'subtopics' ? (
        bookmarkedSubtopics.length === 0 ? (
          <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-10 text-center space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-[#78716C]" />
            <p className="text-sm font-medium text-[#1C1917] dark:text-[#F4EFE6]">
              هنوز مبحثی نشان‌گذاری نشده است.
            </p>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              در فهرست ابواب کنار عنوان هر مبحث می‌توانید آیکون نشان‌گذاری را بزنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedSubtopics.map(subId => {
              const sub = subtopicsById.get(subId);
              if (!sub) return null;
              const ch = chaptersById.get(sub.chapterId);
              return (
                <div
                  key={subId}
                  className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-4 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelectSubtopicFromSaved(sub.chapterId, sub.id)}
                    className="text-right flex-1 cursor-pointer group"
                  >
                    <div className="text-xs text-[#9A6B25] dark:text-[#D4AF37]">{ch?.title}</div>
                    <div className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6] group-hover:text-[#0F4C46] dark:group-hover:text-[#2DD4BF] mt-0.5">
                      {sub.title}
                    </div>
                    <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1 tabular-nums">
                      {toPersianDigits(sub.questionCount)} استفتاء · ص {toPersianDigits(sub.startPage)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBookmarkSubtopic(subId)}
                    aria-label={`حذف نشان مبحث ${sub.title}`}
                    className="p-2 text-[#9A6B25] dark:text-[#D4AF37] hover:opacity-75 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" fill="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-10 text-center space-y-2">
          <StickyNote className="w-8 h-8 mx-auto text-[#78716C]" />
          <p className="text-sm font-medium text-[#1C1917] dark:text-[#F4EFE6]">
            موردی برای نمایش وجود ندارد.
          </p>
          <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
            روی دکمه «نشان‌گذاری» یا «یادداشت شخصی» زیر هر استفتاء بزنید تا در این بخش ذخیره شود.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map(q => (
            <QuestionCard
              key={q.id}
              item={q}
              chapterTitle={chaptersById.get(q.chapterId)?.title || ''}
              subtopicTitle={subtopicsById.get(q.subtopicId)?.title || ''}
              highlightQuery={filterText}
              fontScale={fontScale}
              bookmark={bookmarkMap.get(q.id)}
              note={noteMap.get(q.id)}
              onToggleBookmark={onToggleBookmark}
              onUpdateBookmark={onUpdateBookmark}
              onSaveNote={onSaveNote}
              onDeleteNote={onDeleteNote}
              onOpenShare={onOpenShare}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
