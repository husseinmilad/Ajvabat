import React from 'react';
import {SlidersHorizontal, Search, RotateCcw, Bookmark, StickyNote} from 'lucide-react';
import type {
  Chapter,
  RulingFilter,
  SearchMatchMode,
  SearchOptions,
  SearchScope,
} from '../types/book.ts';
import {toPersianDigits} from '../utils/persian.ts';

interface SearchControlsProps {
  chapters: Chapter[];
  options: SearchOptions;
  onChange: (next: SearchOptions) => void;
  onReset: () => void;
  resultCount: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

const MATCH_MODES: Array<{id: SearchMatchMode; label: string}> = [
  {id: 'all', label: 'همه واژه‌ها'},
  {id: 'any', label: 'هر یک از واژه‌ها'},
  {id: 'exact', label: 'عبارت دقیق'},
];

const SCOPES: Array<{id: SearchScope; label: string}> = [
  {id: 'both', label: 'سؤال و پاسخ'},
  {id: 'question', label: 'فقط متن سؤال'},
  {id: 'answer', label: 'فقط متن پاسخ'},
];

const RULINGS: Array<{id: RulingFilter; label: string}> = [
  {id: 'all', label: 'همه احکام'},
  {id: 'ehtiyat', label: 'احتیاط واجب'},
  {id: 'haram', label: 'حرام / جایز نیست'},
  {id: 'jayez', label: 'جایز / صحیح'},
  {id: 'batil', label: 'باطل / مبطل'},
  {id: 'wajib', label: 'واجب / لازم'},
  {id: 'kaffarah', label: 'قضا / کفاره'},
];

export function SearchControls({
  chapters,
  options,
  onChange,
  onReset,
  resultCount,
  expanded,
  onToggleExpanded,
  searchInputRef,
}: SearchControlsProps) {
  const hasActiveFilters =
    Boolean(options.query.trim()) ||
    options.chapterIds.length > 0 ||
    Boolean(options.subtopicId) ||
    options.ruling !== 'all' ||
    options.matchMode !== 'all' ||
    options.scope !== 'both' ||
    Boolean(options.onlyBookmarked) ||
    Boolean(options.onlyWithNotes);

  const toggleChapterId = (id: string) => {
    const exists = options.chapterIds.includes(id);
    const nextIds = exists
      ? options.chapterIds.filter(c => c !== id)
      : [...options.chapterIds, id];
    onChange({...options, chapterIds: nextIds, subtopicId: null});
  };

  return (
    <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-4 space-y-4">
      {/* Main Search Input + Advanced Toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <label htmlFor="workspace-search-input" className="sr-only">
            جستجو در متن سؤال، پاسخ و پاورقی‌ها
          </label>
          <Search className="w-4 h-4 text-[#78716C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            id="workspace-search-input"
            type="search"
            value={options.query}
            onChange={e => onChange({...options, query: e.target.value})}
            placeholder="جستجوی ساده یا پیشرفته (متن فارسی/عربی یا شماره سؤال مثل س ۴۵۸)..."
            className="w-full pr-10 pl-4 py-2.5 text-sm bg-[#F8F5EE] dark:bg-[#111315] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] placeholder:text-[#78716C] focus:outline-none focus:border-[#0F4C46] dark:focus:border-[#2DD4BF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
              expanded
                ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF]'
                : 'bg-[#F8F5EE] dark:bg-[#22272C] border-[#D6CEBE] dark:border-[#2D333A] text-[#1C1917] dark:text-[#F4EFE6] hover:border-[#0F4C46]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فیلترهای پیشرفته</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-[#9A3412] dark:text-[#FCA5A5] bg-[#FEF2F2] dark:bg-[#450A0A]/40 border border-[#FECACA] dark:border-[#7F1D1D] rounded-md hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک کردن</span>
            </button>
          )}
        </div>
      </div>

      {/* Ruling Quick-Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E2D9C8]/70 dark:border-[#2D333A]/70">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] ml-1">نوع حکم:</span>
          {RULINGS.map(r => {
            const active = options.ruling === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChange({...options, ruling: r.id})}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF] font-medium'
                    : 'bg-transparent border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46]/60'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
          نتیجه: <strong className="text-[#1C1917] dark:text-[#F4EFE6]">{toPersianDigits(resultCount)}</strong> استفتاء
        </div>
      </div>

      {/* Expandable Advanced Search Controls */}
      {expanded && (
        <div className="pt-3 border-t border-[#E2D9C8] dark:border-[#2D333A] space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Match Mode */}
            <div className="xl:col-span-4 space-y-1.5">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                نحوه تطبیق واژه‌ها
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MATCH_MODES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChange({...options, matchMode: m.id})}
                    className={`px-2.5 py-1.5 text-xs rounded-md border cursor-pointer transition-colors whitespace-nowrap ${
                      options.matchMode === m.id
                        ? 'bg-[#0F4C46]/12 dark:bg-[#2DD4BF]/15 border-[#0F4C46] dark:border-[#2DD4BF] text-[#0F4C46] dark:text-[#2DD4BF] font-semibold'
                        : 'border-[#D6CEBE] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Scope */}
            <div className="xl:col-span-5 space-y-1.5">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                محدوده جستجو در متن
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SCOPES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange({...options, scope: s.id})}
                    className={`px-2.5 py-1.5 text-xs rounded-md border cursor-pointer transition-colors whitespace-nowrap ${
                      options.scope === s.id
                        ? 'bg-[#0F4C46]/12 dark:bg-[#2DD4BF]/15 border-[#0F4C46] dark:border-[#2DD4BF] text-[#0F4C46] dark:text-[#2DD4BF] font-semibold'
                        : 'border-[#D6CEBE] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Filters */}
            <div className="xl:col-span-3 space-y-1.5">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                فیلتر نشانه‌ها و یادداشت‌ها
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onChange({...options, onlyBookmarked: !options.onlyBookmarked})
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                    options.onlyBookmarked
                      ? 'bg-[#9A6B25]/15 border-[#9A6B25] text-[#9A6B25] dark:text-[#D4AF37] font-semibold'
                      : 'border-[#D6CEBE] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>فقط نشان‌شده‌ها</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({...options, onlyWithNotes: !options.onlyWithNotes})
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                    options.onlyWithNotes
                      ? 'bg-[#9A6B25]/15 border-[#9A6B25] text-[#9A6B25] dark:text-[#D4AF37] font-semibold'
                      : 'border-[#D6CEBE] dark:border-[#2D333A] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>دارای یادداشت</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Chapter Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                محدود کردن جستجو به ابواب منتخب:
              </span>
              {options.chapterIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({...options, chapterIds: [], subtopicId: null})}
                  className="text-xs text-[#0F4C46] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  انتخاب همه ابواب
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chapters.map(ch => {
                const selected = options.chapterIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapterId(ch.id)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF] font-medium'
                        : 'bg-[#F8F5EE] dark:bg-[#22272C] border-[#E2D9C8] dark:border-[#2D333A] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#0F4C46]/50'
                    }`}
                  >
                    {ch.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
