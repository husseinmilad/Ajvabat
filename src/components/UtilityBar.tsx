import React from 'react';
import {Sun, Moon, Hash} from 'lucide-react';
import type {ThemeMode} from '../types/book.ts';
import {toAsciiDigits, toPersianDigits} from '../utils/persian.ts';

interface UtilityBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onJumpToQuestion: (id: number) => void;
}

export function UtilityBar({
  theme,
  onToggleTheme,
  onJumpToQuestion,
}: UtilityBarProps) {
  const [jumpInput, setJumpInput] = React.useState('');

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number.parseInt(toAsciiDigits(jumpInput).replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 2118) {
      onJumpToQuestion(num);
      setJumpInput('');
    }
  };

  return (
    <div className="border-b border-[#E2D9C8] dark:border-[#2D333A] bg-[#EFE9DC]/60 dark:bg-[#191D21]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Right: Quiet unboxed offline archive indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] tabular-nums">
          <span>نسخه آفلاین کامل</span>
          <span aria-hidden="true">·</span>
          <span>{toPersianDigits(2118)} استفتاء</span>
          <span aria-hidden="true">·</span>
          <span>{toPersianDigits(529)} صفحه</span>
        </div>

        {/* Left: Quick jump + Theme toggle */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 sm:gap-3 flex-wrap">
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
            <label htmlFor="quick-jump-input" className="sr-only">
              پرش سریع به شماره استفتاء
            </label>
            <div className="relative flex items-center">
              <Hash className="w-3.5 h-3.5 text-[#57534E] dark:text-[#A8A29E] absolute right-2 pointer-events-none" />
              <input
                id="quick-jump-input"
                type="text"
                inputMode="numeric"
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value)}
                placeholder="شماره سؤال (۱-۲۱۱۸)"
                className="w-36 sm:w-40 min-h-[36px] pr-7 pl-2 py-1 text-xs bg-[#FFFDF8] dark:bg-[#111315] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] placeholder:text-[#78716C] focus:outline-none focus:border-[#0E5C31] dark:focus:border-[#2DD4BF] tabular-nums"
              />
            </div>
            <button
              type="submit"
              className="px-3 min-h-[36px] text-xs font-medium bg-[#FFFDF8] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0E5C31] dark:hover:border-[#2DD4BF] text-[#1C1917] dark:text-[#F4EFE6] rounded-md transition-colors cursor-pointer"
            >
              برو
            </button>
          </form>

          <span className="hidden sm:inline text-[#D6CEBE] dark:text-[#2D333A]" aria-hidden="true">
            |
          </span>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'تغییر به حالت مطالعه شب' : 'تغییر به حالت روز'}
            className="inline-flex items-center gap-1.5 px-2.5 min-h-[36px] text-xs font-medium bg-[#FFFDF8] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0E5C31] dark:hover:border-[#2DD4BF] text-[#1C1917] dark:text-[#F4EFE6] rounded-md transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#57534E]" />
                <span className="hidden sm:inline">حالت شب</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">حالت روز</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="sr-only">تعداد کل استفتائات: {toPersianDigits(2118)}</div>
    </div>
  );
}
