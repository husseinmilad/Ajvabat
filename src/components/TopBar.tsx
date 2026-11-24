import React from 'react';
import {Search, BookOpen, Bookmark, Info} from 'lucide-react';
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
    <header className="sticky top-0 z-40 pt-safe border-b border-[#E2D9C8] dark:border-[#2D333A] bg-[#F8F5EE]/95 dark:bg-[#111315]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 md:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Attached Logo */}
        <button
          type="button"
          onClick={() => onChangeView('browse')}
          className="flex items-center gap-2.5 text-right cursor-pointer shrink-0 group min-h-[40px]"
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/aistudio/a______________________11e307c1.webp`}
            alt="لوگوی اجوبة‌الاستفتائات"
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover shadow-xs transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-editorial text-lg md:text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#F4EFE6] whitespace-nowrap">
            اجوبة‌الاستفتائات
          </span>
        </button>

        {/* Zone 2: Desktop Single-line Navigation */}
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 min-h-[38px] md:min-h-[40px] text-xs md:text-sm font-medium bg-[#0E5C31] hover:bg-[#0A4624] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>جستجوی مسأله</span>
        </button>
      </div>
    </header>
  );
}

export function MobileBottomNav({
  activeView,
  onChangeView,
  savedCount,
}: {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  savedCount: number;
}) {
  const items: Array<{id: AppView; label: string; icon: typeof BookOpen}> = [
    {id: 'browse', label: 'اطلس ابواب', icon: BookOpen},
    {id: 'search', label: 'جستجو', icon: Search},
    {
      id: 'saved',
      label: savedCount > 0 ? `نشانه‌ها (${toPersianDigits(savedCount)})` : 'نشانه‌ها',
      icon: Bookmark,
    },
    {id: 'about', label: 'درباره', icon: Info},
  ];

  return (
    <nav
      aria-label="ناوبری سریع موبایل"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#F8F5EE]/95 dark:bg-[#111315]/95 backdrop-blur-md border-t border-[#E2D9C8] dark:border-[#2D333A]"
    >
      <div className="grid grid-cols-4 h-[52px]">
        {items.map(item => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] cursor-pointer transition-colors ${
                active
                  ? 'text-[#0E5C31] dark:text-[#2DD4BF] font-semibold'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className="text-[10.5px] leading-none whitespace-nowrap tabular-nums">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
