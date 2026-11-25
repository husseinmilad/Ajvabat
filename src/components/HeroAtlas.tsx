import React, {useState} from 'react';
import {
  BookOpen,
  Droplets,
  Compass,
  MoonStar,
  Coins,
  ShieldCheck,
  Palette,
  HeartPulse,
  Scale,
  Landmark,
  Building2,
  ScrollText,
  Search,
  ChevronLeft,
} from 'lucide-react';
import type {Chapter} from '../types/book.ts';
import {HeroArchivalMandala} from './IslamicMotif.tsx';
import {toPersianDigits} from '../utils/persian.ts';

interface HeroAtlasProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  onQuickSearch: (term: string) => void;
  searchInputValue: string;
  onSearchInputChange: (val: string) => void;
  onOpenAdvancedSearch: () => void;
}

const CHAPTER_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  taqlid: BookOpen,
  taharat: Droplets,
  namaz: Compass,
  roozeh: MoonStar,
  khoms: Coins,
  amr: ShieldCheck,
  'kasb-honar': Palette,
  'pezeshki-farhang': HeartPulse,
  moamelat: Scale,
  'oqud-bank': Landmark,
  qavanin: Building2,
  waqf: ScrollText,
};

const CHAPTER_PALETTES = [
  'bg-[#0F4C46]',
  'bg-[#17645C]',
  'bg-[#1F7A70]',
  'bg-[#8B5E22]',
  'bg-[#A4722C]',
  'bg-[#2C5F5B]',
  'bg-[#6E4B23]',
  'bg-[#134E4A]',
  'bg-[#785324]',
  'bg-[#1A5D57]',
  'bg-[#4A5553]',
  'bg-[#8A662E]',
];

const QUICK_TOPICS = [
  'نماز مسافر',
  'خمس مؤونه',
  'تقلید و عدول',
  'احکام روزه',
  'جایزه بانکی',
  'موسیقی و غنا',
  'وقف و مسجد',
];

export function HeroAtlas({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onQuickSearch,
  searchInputValue,
  onSearchInputChange,
  onOpenAdvancedSearch,
}: HeroAtlasProps) {
  const [hoveredChapter, setHoveredChapter] = useState<Chapter | null>(null);
  const [draftQuery, setDraftQuery] = useState(searchInputValue);
  const isComposingRef = React.useRef(false);
  const lastCommittedRef = React.useRef(searchInputValue);
  const debounceTimerRef = React.useRef<number | null>(null);
  const totalQ = chapters.reduce((acc, c) => acc + c.questionCount, 0) || 2118;

  React.useEffect(() => {
    if (!isComposingRef.current && searchInputValue !== lastCommittedRef.current) {
      lastCommittedRef.current = searchInputValue;
      setDraftQuery(searchInputValue);
    }
  }, [searchInputValue]);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const commitQuery = (val: string, immediate = false) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (immediate) {
      lastCommittedRef.current = val;
      onSearchInputChange(val);
      return;
    }
    debounceTimerRef.current = window.setTimeout(() => {
      lastCommittedRef.current = val;
      onSearchInputChange(val);
    }, 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    lastCommittedRef.current = draftQuery;
    onQuickSearch(draftQuery);
  };

  return (
    <section
      aria-label="اطلس گرافیکی و جستجوی کتاب"
      className="relative overflow-hidden border-b border-[#E2D9C8] dark:border-[#2D333A] islamic-lattice"
    >
      <div className="pointer-events-none absolute -left-24 -top-24 w-96 h-96 hidden lg:block">
        <HeroArchivalMandala className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
        {/* Editorial Title + Fast Search Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs tracking-wide text-[#9A6B25] dark:text-[#D4AF37] font-medium">
              مرجع تعاملی استفتائات فقهی · ۲٬۱۱۸ پرسش و پاسخ مستند · ۵۲۹ صفحه
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] dark:text-[#F4EFE6] leading-tight">
              اجوبة‌الاستفتائات
            </h1>
            <p className="text-sm sm:text-base text-[#44403C] dark:text-[#D6D3D1] max-w-2xl leading-relaxed">
              پاسخ پرسش‌های شرعی شهید آیت‌الله سید علی خامنه‌ای{' '}
              <span className="text-[#9A6B25] dark:text-[#D4AF37] font-editorial">
                (قدس‌الله‌نفسه‌الزکیه)
              </span>{' '}
              با جستجوی دقیق در متون، اطلس گرافیکی ابواب، یادداشت‌برداری شخصی و اشتراک‌گذاری متنی و تصویری.
            </p>

            {/* Primary Search Box */}
            <form onSubmit={handleSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <label htmlFor="hero-search-input" className="sr-only">
                  جستجو در متن سؤال، پاسخ یا شماره استفتاء
                </label>
                <Search className="w-4 h-4 text-[#78716C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="hero-search-input"
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={draftQuery}
                  onCompositionStart={() => {
                    isComposingRef.current = true;
                  }}
                  onCompositionEnd={e => {
                    isComposingRef.current = false;
                    const val = e.currentTarget.value;
                    setDraftQuery(val);
                    commitQuery(val, false);
                  }}
                  onChange={e => {
                    const val = e.target.value;
                    setDraftQuery(val);
                    if (!isComposingRef.current) {
                      commitQuery(val, false);
                    }
                  }}
                  placeholder="جستجوی موضوع، واژه شرعی یا شماره سؤال (مثلاً: نماز مسافر، پرنده، س ۴۵۸)..."
                  className="w-full pr-10 pl-4 py-3 text-sm bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] rounded-md text-[#1C1917] dark:text-[#F4EFE6] placeholder:text-[#78716C] focus:outline-none focus:border-[#0F4C46] dark:focus:border-[#2DD4BF] shadow-xs"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-medium bg-[#0F4C46] hover:bg-[#0B3B36] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  جستجو
                </button>
                <button
                  type="button"
                  onClick={() => {
                    commitQuery(draftQuery, true);
                    onOpenAdvancedSearch();
                  }}
                  className="px-4 py-3 text-sm font-medium bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0F4C46] dark:hover:border-[#2DD4BF] text-[#1C1917] dark:text-[#F4EFE6] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  جستجوی پیشرفته
                </button>
              </div>
            </form>

            {/* Interactive Quick Topic Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">مباحث پرمراجعه:</span>
              {QUICK_TOPICS.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onQuickSearch(topic)}
                  className="px-2.5 py-1 text-xs text-[#0F4C46] dark:text-[#2DD4BF] bg-[#FFFDF8] dark:bg-[#191D21] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0F4C46] dark:hover:border-[#2DD4BF] rounded-md transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Proportional Distribution Visual */}
          <div className="lg:col-span-5 bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D9C8] dark:border-[#2D333A] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6]">
                  توزیع گرافیکی ۲٬۱۱۸ استفتاء
                </h2>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                  برای مشاهده یا فیلتر روی هر بخش کلیک کنید
                </p>
              </div>
              <span className="text-xs font-medium text-[#9A6B25] dark:text-[#D4AF37] tabular-nums">
                ۱۲ باب فقهی
              </span>
            </div>

            {/* Proportional stacked bar */}
            <div
              className="h-5 w-full flex rounded-sm overflow-hidden border border-[#E2D9C8] dark:border-[#2D333A]"
              role="group"
              aria-label="نمودار فراوانی ابواب کتاب"
            >
              {chapters.map((ch, idx) => {
                const pct = (ch.questionCount / totalQ) * 100;
                const isSelected = selectedChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    style={{width: `${pct}%`}}
                    onMouseEnter={() => setHoveredChapter(ch)}
                    onMouseLeave={() => setHoveredChapter(null)}
                    onClick={() => onSelectChapter(isSelected ? null : ch.id)}
                    title={`${ch.title}: ${toPersianDigits(ch.questionCount)} استفتاء`}
                    aria-label={`${ch.title} (${toPersianDigits(ch.questionCount)} مسأله)`}
                    className={`${CHAPTER_PALETTES[idx % CHAPTER_PALETTES.length]} h-full transition-opacity cursor-pointer border-l border-[#F8F5EE]/30 last:border-l-0 ${
                      selectedChapterId && !isSelected ? 'opacity-40 hover:opacity-85' : 'opacity-95 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>

            {/* Live inspected chapter caption */}
            <div className="min-h-[3.25rem] flex items-center justify-between gap-3 px-3 py-2 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A]">
              {(() => {
                const activeCh =
                  hoveredChapter ||
                  chapters.find(c => c.id === selectedChapterId) ||
                  chapters[2]; // Default highlight: Ahkam Namaz (largest)
                if (!activeCh) return null;
                return (
                  <>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C1917] dark:text-[#F4EFE6] truncate">
                        {activeCh.title}
                      </div>
                      <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] truncate">
                        {activeCh.subtitle}
                      </div>
                    </div>
                    <div className="text-left shrink-0 tabular-nums">
                      <div className="text-xs font-bold text-[#0F4C46] dark:text-[#2DD4BF]">
                        {toPersianDigits(activeCh.questionCount)} مسأله
                      </div>
                      <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                        ص {toPersianDigits(activeCh.startPage)}–{toPersianDigits(activeCh.endPage)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Interactive 12-Chapter Graphical Atlas Grid */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6]">
              اطلس موضوعی ابواب کتاب
            </h2>
            {selectedChapterId && (
              <button
                type="button"
                onClick={() => onSelectChapter(null)}
                className="text-xs text-[#0F4C46] dark:text-[#2DD4BF] hover:underline cursor-pointer"
              >
                نمایش همه ۲٬۱۱۸ مسأله
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {chapters.map((ch, idx) => {
              const Icon = CHAPTER_ICONS[ch.id] || BookOpen;
              const active = selectedChapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelectChapter(active ? null : ch.id)}
                  className={`group text-right p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-[#0F4C46] text-white border-[#0F4C46] dark:bg-[#2DD4BF] dark:text-[#111315] dark:border-[#2DD4BF]'
                      : 'bg-[#FFFDF8] dark:bg-[#191D21] border-[#E2D9C8] dark:border-[#2D333A] hover:border-[#0F4C46]/60 dark:hover:border-[#2DD4BF]/60 text-[#1C1917] dark:text-[#F4EFE6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active
                          ? 'text-white dark:text-[#111315]'
                          : 'text-[#0F4C46] dark:text-[#2DD4BF]'
                      }`}
                    />
                    <span
                      className={`text-[11px] tabular-nums ${
                        active
                          ? 'text-white/80 dark:text-[#111315]/80'
                          : 'text-[#9A6B25] dark:text-[#D4AF37]'
                      }`}
                    >
                      {toPersianDigits(String(idx + 1).padStart(2, '0'))}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold leading-5 line-clamp-1">{ch.title}</div>
                    <div
                      className={`text-[11px] mt-0.5 tabular-nums flex items-center justify-between ${
                        active
                          ? 'text-white/85 dark:text-[#111315]/80'
                          : 'text-[#78716C] dark:text-[#A8A29E]'
                      }`}
                    >
                      <span>{toPersianDigits(ch.questionCount)} استفتاء</span>
                      <ChevronLeft className="w-3 h-3 opacity-60 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
