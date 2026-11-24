/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {Suspense, lazy, useEffect, useMemo, useRef, useState} from 'react';
import {ListFilter, ArrowUp, BookOpen, SearchX} from 'lucide-react';
import type {
  BookDataset,
  BookmarkEntry,
  Chapter,
  FontScale,
  IstiftaItem,
  NoteEntry,
  SearchOptions,
  Subtopic,
  UserDataBackup,
  UserPreferences,
} from './types/book.ts';
import {buildSearchIndex, searchQuestions} from './utils/search.ts';
import {
  loadBookmarkedSubtopics,
  loadBookmarks,
  loadNotes,
  loadPreferences,
  saveBookmarkedSubtopics,
  saveBookmarks,
  saveNotes,
  savePreferences,
} from './utils/storage.ts';
import {toPersianDigits} from './utils/persian.ts';
import {TopBar, type AppView} from './components/TopBar.tsx';
import {UtilityBar} from './components/UtilityBar.tsx';
import {HeroAtlas} from './components/HeroAtlas.tsx';
import {TopicSidebar} from './components/TopicSidebar.tsx';
import {SearchControls} from './components/SearchControls.tsx';
import {QuestionCard} from './components/QuestionCard.tsx';

const QuestionDetailModal = lazy(() =>
  import('./components/QuestionDetailModal.tsx').then(m => ({default: m.QuestionDetailModal})),
);
const ShareModal = lazy(() =>
  import('./components/ShareModal.tsx').then(m => ({default: m.ShareModal})),
);
const BookmarksNotesView = lazy(() =>
  import('./components/BookmarksNotesView.tsx').then(m => ({default: m.BookmarksNotesView})),
);
const AboutView = lazy(() =>
  import('./components/AboutView.tsx').then(m => ({default: m.AboutView})),
);

const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  query: '',
  matchMode: 'all',
  scope: 'both',
  chapterIds: [],
  subtopicId: null,
  ruling: 'all',
  onlyBookmarked: false,
  onlyWithNotes: false,
};

const PAGE_STEP = 25;

export default function App() {
  const [dataset, setDataset] = useState<BookDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<AppView>('browse');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(() => loadBookmarks());
  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes());
  const [bookmarkedSubtopics, setBookmarkedSubtopics] = useState<string[]>(() =>
    loadBookmarkedSubtopics(),
  );
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());

  const [detailQuestion, setDetailQuestion] = useState<IstiftaItem | null>(null);
  const [shareQuestion, setShareQuestion] = useState<IstiftaItem | null>(null);

  const workspaceSearchRef = useRef<HTMLInputElement | null>(null);
  const workspaceTopRef = useRef<HTMLDivElement | null>(null);

  // Fetch complete parsed book dataset (cached locally by Service Worker for offline mode)
  const fetchBookData = React.useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/ajwibah.json`);
      if (!res.ok) throw new Error('دریافت متن کتاب با خطا مواجه شد.');
      const json = (await res.json()) as BookDataset;
      setDataset(json);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'خطا در بارگذاری داده‌های کتاب.',
      );
    }
  }, []);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  // Apply light/dark theme on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    savePreferences(prefs);
  }, [prefs]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveBookmarkedSubtopics(bookmarkedSubtopics);
  }, [bookmarkedSubtopics]);

  // Fast lookup maps
  const {chaptersById, subtopicsById, questionsById, searchIndex} = useMemo(() => {
    const cMap = new Map<string, Chapter>();
    const sMap = new Map<string, Subtopic>();
    const qMap = new Map<number, IstiftaItem>();

    if (!dataset) {
      return {
        chaptersById: cMap,
        subtopicsById: sMap,
        questionsById: qMap,
        searchIndex: [],
      };
    }

    for (const ch of dataset.chapters) {
      cMap.set(ch.id, ch);
      for (const sub of ch.subtopics) {
        sMap.set(sub.id, sub);
      }
    }
    for (const q of dataset.questions) {
      qMap.set(q.id, q);
    }

    return {
      chaptersById: cMap,
      subtopicsById: sMap,
      questionsById: qMap,
      searchIndex: buildSearchIndex(dataset.questions),
    };
  }, [dataset]);

  // Deep-link ?q=<id> support
  useEffect(() => {
    if (!dataset) return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam) {
      const id = Number.parseInt(qParam, 10);
      const found = questionsById.get(id);
      if (found) {
        setDetailQuestion(found);
      }
    }
  }, [dataset, questionsById]);

  // Global keyboard shortcut Ctrl+K / '/' to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveView('search');
        setAdvancedExpanded(true);
        setTimeout(() => workspaceSearchRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bookmarkMap = useMemo(() => {
    const m = new Map<number, BookmarkEntry>();
    for (const b of bookmarks) m.set(b.questionId, b);
    return m;
  }, [bookmarks]);

  const noteMap = useMemo(() => {
    const m = new Map<number, NoteEntry>();
    for (const n of notes) m.set(n.questionId, n);
    return m;
  }, [notes]);

  const bookmarkIdSet = useMemo(() => new Set(bookmarks.map(b => b.questionId)), [bookmarks]);
  const noteIdSet = useMemo(() => new Set(notes.map(n => n.questionId)), [notes]);
  const subtopicBookmarkSet = useMemo(
    () => new Set(bookmarkedSubtopics),
    [bookmarkedSubtopics],
  );

  // Execute search / filter
  const searchResult = useMemo(() => {
    return searchQuestions(searchIndex, searchOptions, bookmarkIdSet, noteIdSet);
  }, [searchIndex, searchOptions, bookmarkIdSet, noteIdSet]);

  // Reset visible pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [searchOptions]);

  const visibleItems = useMemo(
    () => searchResult.items.slice(0, visibleCount),
    [searchResult.items, visibleCount],
  );

  // Handlers
  const handleToggleBookmark = (questionId: number) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.questionId === questionId);
      if (exists) {
        return prev.filter(b => b.questionId !== questionId);
      }
      return [
        ...prev,
        {
          questionId,
          important: false,
          category: 'عمومی',
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  const handleUpdateBookmark = (questionId: number, patch: Partial<BookmarkEntry>) => {
    setBookmarks(prev =>
      prev.map(b => (b.questionId === questionId ? {...b, ...patch} : b)),
    );
  };

  const handleSaveNote = (questionId: number, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setNotes(prev => {
      const idx = prev.findIndex(n => n.questionId === questionId);
      const nextEntry: NoteEntry = {
        questionId,
        text: clean,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = nextEntry;
        return copy;
      }
      return [...prev, nextEntry];
    });
  };

  const handleDeleteNote = (questionId: number) => {
    setNotes(prev => prev.filter(n => n.questionId !== questionId));
  };

  const handleToggleBookmarkSubtopic = (subtopicId: string) => {
    setBookmarkedSubtopics(prev =>
      prev.includes(subtopicId) ? prev.filter(s => s !== subtopicId) : [...prev, subtopicId],
    );
  };

  const handleSelectChapter = (chapterId: string | null) => {
    setActiveView('browse');
    setSearchOptions(prev => ({
      ...prev,
      chapterIds: chapterId ? [chapterId] : [],
      subtopicId: null,
    }));
    setTimeout(() => {
      workspaceTopRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 40);
  };

  const handleSelectSubtopic = (chapterId: string, subtopicId: string | null) => {
    setActiveView('browse');
    setSearchOptions(prev => ({
      ...prev,
      chapterIds: [chapterId],
      subtopicId,
    }));
    setTimeout(() => {
      workspaceTopRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 40);
  };

  const handleJumpToQuestion = (id: number) => {
    const found = questionsById.get(id);
    if (found) {
      setDetailQuestion(found);
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchOptions(prev => ({...prev, query: term}));
    if (activeView !== 'browse' && activeView !== 'search') {
      setActiveView('browse');
    }
    setTimeout(() => {
      workspaceTopRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 40);
  };

  const handleFocusSearch = () => {
    setActiveView('search');
    setAdvancedExpanded(true);
    setTimeout(() => workspaceSearchRef.current?.focus(), 60);
  };

  const handleChangeView = (view: AppView) => {
    setActiveView(view);
    if (view === 'search') {
      setAdvancedExpanded(true);
      setTimeout(() => workspaceSearchRef.current?.focus(), 60);
    }
  };

  const handleImportBackup = (backup: UserDataBackup) => {
    setBookmarks(backup.bookmarks);
    setNotes(backup.notes);
    setBookmarkedSubtopics(backup.bookmarkedSubtopics);
  };

  const activeSingleChapter =
    searchOptions.chapterIds.length === 1
      ? chaptersById.get(searchOptions.chapterIds[0]) || null
      : null;
  const activeSubtopic = searchOptions.subtopicId
    ? subtopicsById.get(searchOptions.subtopicId) || null
    : null;

  const totalSavedItems = new Set([
    ...bookmarks.map(b => b.questionId),
    ...notes.map(n => n.questionId),
  ]).size;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] dark:bg-[#111315] text-[#1C1917] dark:text-[#F4EFE6]">
      <TopBar
        activeView={activeView}
        onChangeView={handleChangeView}
        savedCount={totalSavedItems}
        onFocusSearch={handleFocusSearch}
      />

      <UtilityBar
        theme={prefs.theme}
        onToggleTheme={() =>
          setPrefs(p => ({...p, theme: p.theme === 'light' ? 'dark' : 'light'}))
        }
        fontScale={prefs.fontScale}
        onChangeFontScale={(fontScale: FontScale) => setPrefs(p => ({...p, fontScale}))}
        onJumpToQuestion={handleJumpToQuestion}
      />

      {!dataset ? (
        <main className="flex-1 flex items-center justify-center p-6">
          {loadError ? (
            <div className="max-w-md w-full bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-6 text-center space-y-3">
              <p className="text-sm font-medium text-[#9A3412] dark:text-[#FCA5A5]">{loadError}</p>
              <button
                type="button"
                onClick={fetchBookData}
                className="px-4 py-2 text-xs font-medium bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2 py-16">
              <div className="font-editorial text-2xl font-bold text-[#0F4C46] dark:text-[#2DD4BF]">
                اجوبة‌الاستفتائات
              </div>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                در حال آماده‌سازی متن کامل ۲٬۱۱۸ استفتاء برای مطالعه و جستجو...
              </p>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1">
          {activeView === 'saved' ? (
            <Suspense
              fallback={
                <div className="py-16 text-center text-xs text-[#57534E] dark:text-[#A8A29E]">
                  در حال بارگذاری نشانه‌ها و یادداشت‌ها...
                </div>
              }
            >
              <BookmarksNotesView
                questionsById={questionsById}
                chaptersById={chaptersById}
                subtopicsById={subtopicsById}
                bookmarks={bookmarks}
                notes={notes}
                bookmarkedSubtopics={bookmarkedSubtopics}
                fontScale={prefs.fontScale}
                onToggleBookmark={handleToggleBookmark}
                onUpdateBookmark={handleUpdateBookmark}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onOpenShare={setShareQuestion}
                onOpenDetail={setDetailQuestion}
                onSelectSubtopicFromSaved={(chId, subId) => handleSelectSubtopic(chId, subId)}
                onToggleBookmarkSubtopic={handleToggleBookmarkSubtopic}
                onImportBackup={handleImportBackup}
              />
            </Suspense>
          ) : activeView === 'about' ? (
            <Suspense
              fallback={
                <div className="py-16 text-center text-xs text-[#57534E] dark:text-[#A8A29E]">
                  در حال بارگذاری اطلاعات برنامه...
                </div>
              }
            >
              <AboutView onBackToBrowse={() => setActiveView('browse')} />
            </Suspense>
          ) : (
            <>
              {activeView === 'browse' && (
                <HeroAtlas
                  chapters={dataset.chapters}
                  selectedChapterId={
                    searchOptions.chapterIds.length === 1 ? searchOptions.chapterIds[0] : null
                  }
                  onSelectChapter={handleSelectChapter}
                  onQuickSearch={handleQuickSearch}
                  searchInputValue={searchOptions.query}
                  onSearchInputChange={val => setSearchOptions(prev => ({...prev, query: val}))}
                  onOpenAdvancedSearch={() => {
                    setActiveView('search');
                    setAdvancedExpanded(true);
                    setTimeout(() => workspaceSearchRef.current?.focus(), 60);
                  }}
                />
              )}

              {/* Main Reading & Search Workspace */}
              <div
                ref={workspaceTopRef}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 items-start"
              >
                <TopicSidebar
                  chapters={dataset.chapters}
                  selectedChapterId={
                    searchOptions.chapterIds.length === 1 ? searchOptions.chapterIds[0] : null
                  }
                  selectedSubtopicId={searchOptions.subtopicId}
                  bookmarkedSubtopics={subtopicBookmarkSet}
                  onSelectChapter={handleSelectChapter}
                  onSelectSubtopic={handleSelectSubtopic}
                  onToggleBookmarkSubtopic={handleToggleBookmarkSubtopic}
                  mobileOpen={mobileTocOpen}
                  onCloseMobile={() => setMobileTocOpen(false)}
                />

                <div className="flex-1 min-w-0 w-full space-y-4">
                  {/* Mobile TOC Trigger + Active Breadcrumb */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                      <button
                        type="button"
                        onClick={() => setMobileTocOpen(true)}
                        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] font-medium cursor-pointer"
                      >
                        <ListFilter className="w-3.5 h-3.5" />
                        <span>فهرست ابواب</span>
                      </button>

                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#0F4C46] dark:text-[#2DD4BF]" />
                        <span>
                          {activeSingleChapter ? activeSingleChapter.title : 'همه ابواب کتاب'}
                          {activeSubtopic ? ` / ${activeSubtopic.title}` : ''}
                        </span>
                      </span>
                    </div>

                    {searchResult.directQuestionMatch && (
                      <button
                        type="button"
                        onClick={() => handleJumpToQuestion(searchResult.directQuestionMatch!)}
                        className="text-xs font-medium text-[#0F4C46] dark:text-[#2DD4BF] hover:underline cursor-pointer tabular-nums"
                      >
                        باز کردن مستقیم استفتاء {toPersianDigits(searchResult.directQuestionMatch)} در نمای مطالعه
                      </button>
                    )}
                  </div>

                  {/* Interactive Subtopic Bar when 1 chapter is focused */}
                  {activeSingleChapter && activeSingleChapter.subtopics.length > 1 && (
                    <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-3">
                      <div className="text-[11px] font-semibold text-[#78716C] dark:text-[#A8A29E] mb-2">
                        زیرمباحث «{activeSingleChapter.title}»:
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleSelectSubtopic(activeSingleChapter.id, null)}
                          className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors ${
                            !searchOptions.subtopicId
                              ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF]'
                              : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1]'
                          }`}
                        >
                          همه مباحث ({toPersianDigits(activeSingleChapter.questionCount)})
                        </button>
                        {activeSingleChapter.subtopics.map(sub => {
                          const active = searchOptions.subtopicId === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSelectSubtopic(activeSingleChapter.id, sub.id)}
                              className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors tabular-nums ${
                                active
                                  ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF]'
                                  : 'border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46]/50'
                              }`}
                            >
                              {sub.title} ({toPersianDigits(sub.questionCount)})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Search & Filter Controls */}
                  <SearchControls
                    chapters={dataset.chapters}
                    options={searchOptions}
                    onChange={setSearchOptions}
                    onReset={() => setSearchOptions(DEFAULT_SEARCH_OPTIONS)}
                    resultCount={searchResult.items.length}
                    expanded={advancedExpanded}
                    onToggleExpanded={() => setAdvancedExpanded(v => !v)}
                    searchInputRef={workspaceSearchRef}
                  />

                  {/* Results List or Empty State */}
                  {searchResult.items.length === 0 ? (
                    <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-10 text-center space-y-3">
                      <SearchX className="w-10 h-10 mx-auto text-[#78716C]" />
                      <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F4EFE6]">
                        استفتایی با این مشخصات یافت نشد
                      </h3>
                      <p className="text-xs text-[#57534E] dark:text-[#A8A29E] max-w-md mx-auto leading-6">
                        می‌توانید حالت تطبیق را روی «هر یک از واژه‌ها» بگذارید، محدوده جستجو را به «سؤال و پاسخ» گسترش دهید یا فیلترهای باب را پاک کنید.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchOptions(DEFAULT_SEARCH_OPTIONS)}
                        className="px-4 py-2 text-xs font-medium bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
                      >
                        بازنشانی همه فیلترها
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visibleItems.map(item => (
                        <QuestionCard
                          key={item.id}
                          item={item}
                          chapterTitle={chaptersById.get(item.chapterId)?.title || ''}
                          subtopicTitle={subtopicsById.get(item.subtopicId)?.title || ''}
                          highlightQuery={searchOptions.query}
                          fontScale={prefs.fontScale}
                          bookmark={bookmarkMap.get(item.id)}
                          note={noteMap.get(item.id)}
                          onToggleBookmark={handleToggleBookmark}
                          onUpdateBookmark={handleUpdateBookmark}
                          onSaveNote={handleSaveNote}
                          onDeleteNote={handleDeleteNote}
                          onOpenShare={setShareQuestion}
                          onOpenDetail={setDetailQuestion}
                        />
                      ))}

                      {visibleCount < searchResult.items.length && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-4">
                          <span className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                            نمایش ۱ تا {toPersianDigits(visibleItems.length)} از{' '}
                            {toPersianDigits(searchResult.items.length)} استفتاء
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setVisibleCount(c => c + PAGE_STEP)}
                              className="px-5 py-2.5 text-xs font-medium bg-[#0F4C46] hover:bg-[#0B3B36] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md cursor-pointer transition-colors"
                            >
                              نمایش {toPersianDigits(PAGE_STEP)} مسأله بیشتر
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                window.scrollTo({top: 0, behavior: 'smooth'})
                              }
                              aria-label="بازگشت به بالای صفحه"
                              className="p-2.5 bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#57534E] dark:text-[#A8A29E] cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      <footer className="border-t border-[#E2D9C8] dark:border-[#2D333A] bg-[#EFE9DC]/50 dark:bg-[#191D21]/60 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
          <span>
            مرجع تعاملی اجوبة‌الاستفتائات شهید آیت‌الله سید علی خامنه‌ای (قدس‌الله‌نفسه‌الزکیه)
          </span>
          <span className="tabular-nums">
            ۲٬۱۱۸ استفتاء · ۵۲۹ صفحه متن کامل
          </span>
        </div>
      </footer>

      {/* Focused Detail Reading Modal */}
      {detailQuestion && (
        <Suspense fallback={null}>
          <QuestionDetailModal
            item={detailQuestion}
            chapterTitle={chaptersById.get(detailQuestion.chapterId)?.title || ''}
            subtopicTitle={subtopicsById.get(detailQuestion.subtopicId)?.title || ''}
            fontScale={prefs.fontScale}
            bookmark={bookmarkMap.get(detailQuestion.id)}
            note={noteMap.get(detailQuestion.id)}
            onClose={() => setDetailQuestion(null)}
            onNavigate={nextId => {
              const next = questionsById.get(nextId);
              if (next) setDetailQuestion(next);
            }}
            onToggleBookmark={handleToggleBookmark}
            onUpdateBookmark={handleUpdateBookmark}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onOpenShare={setShareQuestion}
          />
        </Suspense>
      )}

      {/* Share Modal */}
      {shareQuestion && (
        <Suspense fallback={null}>
          <ShareModal
            item={shareQuestion}
            chapterTitle={chaptersById.get(shareQuestion.chapterId)?.title || ''}
            subtopicTitle={subtopicsById.get(shareQuestion.subtopicId)?.title || ''}
            personalNoteText={noteMap.get(shareQuestion.id)?.text}
            onClose={() => setShareQuestion(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
