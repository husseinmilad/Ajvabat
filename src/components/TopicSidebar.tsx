import React, {useState} from 'react';
import {ChevronDown, ChevronLeft, Bookmark, X, BookMarked} from 'lucide-react';
import type {Chapter} from '../types/book.ts';
import {toPersianDigits} from '../utils/persian.ts';

interface TopicSidebarProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  selectedSubtopicId: string | null;
  bookmarkedSubtopics: Set<string>;
  onSelectChapter: (chapterId: string | null) => void;
  onSelectSubtopic: (chapterId: string, subtopicId: string | null) => void;
  onToggleBookmarkSubtopic: (subtopicId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function TopicSidebar({
  chapters,
  selectedChapterId,
  selectedSubtopicId,
  bookmarkedSubtopics,
  onSelectChapter,
  onSelectSubtopic,
  onToggleBookmarkSubtopic,
  mobileOpen,
  onCloseMobile,
}: TopicSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    () => new Set([selectedChapterId || 'taqlid']),
  );

  React.useEffect(() => {
    if (selectedChapterId) {
      setExpandedChapters(prev => new Set([...prev, selectedChapterId]));
    }
  }, [selectedChapterId]);

  const toggleExpand = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const treeContent = (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          onSelectChapter(null);
          onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
          !selectedChapterId && !selectedSubtopicId
            ? 'bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315]'
            : 'text-[#1C1917] dark:text-[#F4EFE6] hover:bg-[#EFE9DC] dark:hover:bg-[#22272C]'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <BookMarked className="w-3.5 h-3.5" />
          <span>همه ابواب کتاب</span>
        </span>
        <span className="tabular-nums opacity-80">{toPersianDigits(2118)}</span>
      </button>

      {chapters.map(ch => {
        const isExpanded = expandedChapters.has(ch.id);
        const isChapterSelected = selectedChapterId === ch.id && !selectedSubtopicId;

        return (
          <div
            key={ch.id}
            className="border-b border-[#E2D9C8]/60 dark:border-[#2D333A]/60 pb-1 last:border-b-0"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleExpand(ch.id)}
                aria-label={isExpanded ? `بستن زیرمباحث ${ch.title}` : `باز کردن زیرمباحث ${ch.title}`}
                className="p-1.5 text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F4EFE6] cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectChapter(ch.id);
                  onCloseMobile();
                }}
                className={`flex-1 flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-right transition-colors cursor-pointer ${
                  isChapterSelected
                    ? 'bg-[#0F4C46]/12 dark:bg-[#2DD4BF]/15 text-[#0F4C46] dark:text-[#2DD4BF] font-bold'
                    : 'text-[#1C1917] dark:text-[#F4EFE6] hover:bg-[#EFE9DC]/80 dark:hover:bg-[#22272C] font-medium'
                }`}
              >
                <span className="truncate">{ch.title}</span>
                <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] tabular-nums mr-2 shrink-0">
                  {toPersianDigits(ch.questionCount)}
                </span>
              </button>
            </div>

            {isExpanded && (
              <div className="pr-5 mt-1 space-y-0.5">
                {ch.subtopics.map(sub => {
                  const subActive = selectedSubtopicId === sub.id;
                  const subBookmarked = bookmarkedSubtopics.has(sub.id);
                  return (
                    <div key={sub.id} className="flex items-center gap-1 group">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubtopic(ch.id, sub.id);
                          onCloseMobile();
                        }}
                        className={`flex-1 flex items-center justify-between px-2.5 py-1.5 text-[11.5px] rounded-md text-right transition-colors cursor-pointer ${
                          subActive
                            ? 'bg-[#0F4C46] text-white dark:bg-[#2DD4BF] dark:text-[#111315] font-semibold'
                            : 'text-[#44403C] dark:text-[#D6D3D1] hover:bg-[#EFE9DC]/70 dark:hover:bg-[#22272C]'
                        }`}
                      >
                        <span className="truncate leading-5">{sub.title}</span>
                        <span
                          className={`text-[10px] tabular-nums mr-1.5 shrink-0 ${
                            subActive ? 'opacity-90' : 'text-[#78716C] dark:text-[#A8A29E]'
                          }`}
                        >
                          {toPersianDigits(sub.questionCount)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBookmarkSubtopic(sub.id)}
                        aria-label={`نشان‌گذاری مبحث ${sub.title}`}
                        title={subBookmarked ? 'حذف نشان مبحث' : 'نشان‌گذاری این مبحث'}
                        className={`p-1 rounded transition-opacity cursor-pointer ${
                          subBookmarked
                            ? 'text-[#9A6B25] dark:text-[#D4AF37] opacity-100'
                            : 'text-[#78716C] opacity-0 group-hover:opacity-100 hover:text-[#9A6B25]'
                        }`}
                      >
                        <Bookmark
                          className="w-3 h-3"
                          fill={subBookmarked ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="فهرست تفصیلی ابواب و مباحث"
        className="hidden lg:block w-72 xl:w-80 shrink-0"
      >
        <div className="sticky top-20 bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#E2D9C8] dark:border-[#2D333A] pb-2.5 mb-3">
            <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6]">
              فهرست ابواب و مباحث
            </h2>
            <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] tabular-nums">
              {toPersianDigits(183)} عنوان
            </span>
          </div>
          {treeContent}
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-[#FFFDF8] dark:bg-[#191D21] border-l border-[#E2D9C8] dark:border-[#2D333A] p-4 overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="فهرست ابواب"
          >
            <div className="flex items-center justify-between border-b border-[#E2D9C8] dark:border-[#2D333A] pb-3 mb-3">
              <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6]">
                فهرست ابواب و مباحث
              </h2>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="بستن فهرست"
                className="p-1 text-[#57534E] dark:text-[#A8A29E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {treeContent}
          </div>
        </div>
      )}
    </>
  );
}
