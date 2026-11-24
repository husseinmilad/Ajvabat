import React from 'react';
import {Search} from 'lucide-react';
import {toPersianDigits} from '../utils/persian.ts';

export type AppView = 'browse' | 'search' | 'saved' | 'about';

interface TopBarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  savedCount: number;
  onFocusSearch: () => void;
}

export function TopBar({
  activeView,
  onChangeView,
  savedCount,
  onFocusSearch,
}: TopBarProps) {
  const navItems: Array<{id: AppView; label: string}> = [
    {id: 'browse', label: 'اطلس و ابواب'},
    {id: 'search', label: 'جستجوی پیشرفته'},
    {
      id: 'saved',
      label:
        savedCount > 0
          ? `نشان‌شده‌ها و یادداشت‌ها (${toPersianDigits(savedCount)})`
          : 'نشان‌شده‌ها و یادداشت‌ها',
    },
    {id: 'about', label: 'درباره برنامه'},
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D9C8] dark:border-[#2D333A] bg-[#F8F5EE]/95 dark:bg-[#111315]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Attached Logo */}
        <button
          type="button"
          onClick={() => onChangeView('browse')}
          className="flex items-center gap-2.5 text-right cursor-pointer shrink-0 group"
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/aistudio/a______________________11e307c1.webp`}
            alt="لوگوی اجوبة‌الاستفتائات"
            className="w-10 h-10 rounded-xl object-cover shadow-xs transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#F4EFE6] whitespace-nowrap">
            اجوبة‌الاستفتائات
          </span>
        </button>

        {/* Zone 2: Single-line Navigation */}
        <nav
          aria-label="منوی اصلی"
          className="hidden md:flex items-center gap-1 lg:gap-2 overflow-x-auto"
        >
          {navItems.map(item => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`px-3 py-2 text-sm whitespace-nowrap transition-colors cursor-pointer border-b-2 tabular-nums ${
                  active
                    ? 'border-[#0E5C31] dark:border-[#2DD4BF] text-[#0E5C31] dark:text-[#2DD4BF] font-semibold'
                    : 'border-transparent text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F4EFE6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <button
          type="button"
          onClick={onFocusSearch}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium bg-[#0E5C31] hover:bg-[#0A4624] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>جستجوی مسأله</span>
        </button>
      </div>

      {/* Mobile compact nav row */}
      <nav
        aria-label="منوی موبایل"
        className="flex md:hidden items-center justify-between border-t border-[#E2D9C8]/70 dark:border-[#2D333A]/70 overflow-x-auto px-2 gap-0.5"
      >
        {navItems.map(item => {
          const active = activeView === item.id;
          const mobileLabel =
            item.id === 'saved'
              ? savedCount > 0
                ? `نشانه‌ها و یادداشت (${toPersianDigits(savedCount)})`
                : 'نشانه‌ها و یادداشت'
              : item.label;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={`px-2 py-2.5 text-[11.5px] whitespace-nowrap transition-colors cursor-pointer border-b-2 tabular-nums ${
                active
                  ? 'border-[#0E5C31] dark:border-[#2DD4BF] text-[#0E5C31] dark:text-[#2DD4BF] font-semibold'
                  : 'border-transparent text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              {mobileLabel}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
