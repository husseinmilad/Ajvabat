import React from 'react';
import {BookOpen, Smartphone, Search, Bookmark, Image as ImageIcon, FileText} from 'lucide-react';
import {toPersianDigits} from '../utils/persian.ts';

export function AboutView({onBackToBrowse}: {onBackToBrowse: () => void}) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E2D9C8] dark:border-[#2D333A] pb-5">
          <img
            src="/assets/aistudio/a______________________11e307c1.webp"
            alt="لوگوی اجوبة‌الاستفتائات"
            className="w-16 h-16 rounded-2xl object-cover shadow-sm shrink-0"
          />
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F4EFE6]">
              درباره اپلیکیشن و کتاب اجوبة‌الاستفتائات
            </h1>
            <p className="text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              مجموعه کامل استفتائات فقهی شهید آیت‌الله سید علی خامنه‌ای (قدس‌الله‌نفسه‌الزکیه)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            {label: 'پرسش و پاسخ شرعی', value: toPersianDigits('2,118')},
            {label: 'باب موضوعی اصلی', value: toPersianDigits(12)},
            {label: 'مبحث تفصیلی فهرست', value: toPersianDigits(183)},
            {label: 'صفحه متن منبع', value: toPersianDigits(529)},
          ].map(stat => (
            <div
              key={stat.label}
              className="p-3.5 bg-[#F8F5EE] dark:bg-[#22272C] border border-[#E2D9C8] dark:border-[#2D333A] rounded-md"
            >
              <div className="text-xl font-bold text-[#0E5C31] dark:text-[#2DD4BF] tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-7 text-[#292524] dark:text-[#D6D3D1]">
          <div className="p-4 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0E5C31] dark:text-[#2DD4BF]">
              <Search className="w-4 h-4" />
              <span>جستجوی ساده و پیشرفته</span>
            </div>
            <p className="text-xs leading-6">
              جستجو با یکسان‌سازی خودکار حروف فارسی و عربی (ی/ي، ک/ك، اعراب)، امکان پرش مستقیم با شماره استفتاء (مانند «س ۴۵۸» یا «۴۵۸»)، جستجو در همه واژه‌ها، عبارت دقیق، تفکیک سؤال و پاسخ و فیلتر بر اساس نوع حکم شرعی.
            </p>
          </div>

          <div className="p-4 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0E5C31] dark:text-[#2DD4BF]">
              <Smartphone className="w-4 h-4" />
              <span>نصب مستقل روی اندروید</span>
            </div>
            <p className="text-xs leading-6">
              قابل نصب به صورت اپلیکیشن مستقل روی گوشی‌های اندروید با آیکون اختصاصی و اجرای تمام‌صفحه، به نحوی که در هر زمان از صفحه اصلی گوشی به سادگی در دسترس شما باشد.
            </p>
          </div>

          <div className="p-4 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0E5C31] dark:text-[#2DD4BF]">
              <Bookmark className="w-4 h-4" />
              <span>نشان‌گذاری و یادداشت شخصی</span>
            </div>
            <p className="text-xs leading-6">
              استفتائات و مباحث پرکاربرد را نشان‌گذاری و دسته‌بندی کنید، موارد مهم را ستاره‌دار نمایید، یادداشت شخصی بنویسید و در هر زمان از داده‌های خود نسخه پشتیبان JSON تهیه کنید.
            </p>
          </div>

          <div className="p-4 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0E5C31] dark:text-[#2DD4BF]">
              <ImageIcon className="w-4 h-4" />
              <span>کپی متن و اشتراک‌گذاری تصویری</span>
            </div>
            <p className="text-xs leading-6">
              متن مستند استفتاء را همراه با شماره مسأله و صفحه با یک کلیک کپی کنید یا به صورت کارت گرافیکی زیبا (تصویر PNG) همراه با یادداشت شخصی ذخیره و به اشتراک بگذارید.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2D9C8] dark:border-[#2D333A] flex flex-wrap items-center justify-between gap-3">
          <a
            href="/assets/aistudio/booklet_2__Leader.ir__50180706.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#F8F5EE] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0E5C31] text-[#1C1917] dark:text-[#F4EFE6] rounded-md transition-colors"
          >
            <FileText className="w-4 h-4 text-[#9A6B25] dark:text-[#D4AF37]" />
            <span>مشاهده فایل PDF اصلی کتاب (۵۲۹ صفحه)</span>
          </a>

          <button
            type="button"
            onClick={onBackToBrowse}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0E5C31] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>بازگشت به مطالعه کتاب</span>
          </button>
        </div>
      </div>
    </section>
  );
}
