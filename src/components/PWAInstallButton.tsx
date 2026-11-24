import React, {useEffect, useState} from 'react';
import {Smartphone, X, MoreVertical, CheckCircle2} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as {standalone?: boolean}).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#0E5C31]/35 dark:border-[#2DD4BF]/35 text-[#0E5C31] dark:text-[#2DD4BF] hover:bg-[#0E5C31] hover:text-white dark:hover:bg-[#2DD4BF] dark:hover:text-[#111315] rounded-md transition-colors cursor-pointer whitespace-nowrap"
      >
        <Smartphone className="w-3.5 h-3.5 shrink-0" />
        <span>نصب اپ اندروید</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg p-6 shadow-xl text-right"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="android-install-title"
          >
            <div className="flex items-center justify-between border-b border-[#E2D9C8] dark:border-[#2D333A] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/a______________________11e307c1.webp"
                  alt="آیکون اپ اجوبة‌الاستفتائات"
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <h3
                  id="android-install-title"
                  className="text-base font-bold text-[#1C1917] dark:text-[#F4EFE6]"
                >
                  نصب مستقل اپلیکیشن اندروید
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="بستن راهنمای نصب"
                className="p-1 text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F4EFE6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm leading-7 text-[#44403C] dark:text-[#D6D3D1]">
              <p className="text-xs leading-6">
                این برنامه با استاندارد <strong>Android Standalone App</strong> پیکربندی شده و پس از نصب، با آیکون اختصاصی در صفحه اصلی گوشی و در پنجره تمام‌صفحه مستقل (بدون نوار مرورگر) اجرا می‌شود.
              </p>

              <div className="p-3.5 bg-[#F8F5EE] dark:bg-[#22272C] rounded-md border border-[#E2D9C8] dark:border-[#2D333A] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0E5C31] dark:text-[#2DD4BF]">
                  <MoreVertical className="w-4 h-4 shrink-0" />
                  <span>مراحل نصب در اندروید (Chrome / Samsung Internet):</span>
                </div>
                <ol className="text-xs leading-6 space-y-1 pr-4 list-decimal">
                  <li>برنامه را در مرورگر <strong>Chrome</strong> گوشی اندروید خود باز کنید.</li>
                  <li>روی منوی سه‌نقطه بالا (⋮) بزنید و گزینه <strong>نصب برنامه (Install app)</strong> یا <strong>افزودن به صفحه اصلی (Add to Home screen)</strong> را انتخاب کنید.</li>
                  <li>روی <strong>نصب (Install)</strong> بزنید تا اپ به صورت مستقل در لیست برنامه‌های اندروید نصب شود.</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#0E5C31] dark:text-[#2DD4BF]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>دارای آیکون اختصاصی، اجرای تمام‌صفحه و پشتیبانی از اشتراک‌گذاری تصویر و متن</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-xs font-medium bg-[#0E5C31] text-white dark:bg-[#2DD4BF] dark:text-[#111315] rounded-md cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
