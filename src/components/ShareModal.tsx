import React, {useEffect, useState} from 'react';
import {Capacitor} from '@capacitor/core';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {X, Copy, Check, Image as ImageIcon, Download, Share2} from 'lucide-react';
import type {IstiftaItem} from '../types/book.ts';
import {buildFormattedShareText} from '../utils/share.ts';
import {
  generateQuestionShareImage,
  type GeneratedShareImage,
} from '../utils/shareImage.ts';
import {toPersianDigits} from '../utils/persian.ts';

interface ShareModalProps {
  item: IstiftaItem | null;
  chapterTitle: string;
  subtopicTitle: string;
  personalNoteText?: string;
  onClose: () => void;
}

export function ShareModal({
  item,
  chapterTitle,
  subtopicTitle,
  personalNoteText,
  onClose,
}: ShareModalProps) {
  const [includeNote, setIncludeNote] = useState(Boolean(personalNoteText));
  const [copiedText, setCopiedText] = useState(false);
  const [imageState, setImageState] = useState<{
    loading: boolean;
    result: GeneratedShareImage | null;
    error: string | null;
  }>({loading: false, result: null, error: null});
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIncludeNote(Boolean(personalNoteText));
  }, [item?.id, personalNoteText]);

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    setImageState({loading: true, result: null, error: null});
    setImageFeedback(null);

    generateQuestionShareImage(
      item,
      chapterTitle,
      subtopicTitle,
      includeNote ? personalNoteText : undefined,
    )
      .then(result => {
        if (!cancelled) {
          setImageState({loading: false, result, error: null});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImageState({
            loading: false,
            result: null,
            error: 'امکان ساخت تصویر کارت استفتاء وجود نداشت.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [item, chapterTitle, subtopicTitle, includeNote, personalNoteText]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const formattedText = buildFormattedShareText(
    item,
    chapterTitle,
    subtopicTitle,
    includeNote ? personalNoteText : undefined,
  );

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const downloadImage = async (img: GeneratedShareImage) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = img.dataUrl.split(',')[1] || '';
        const saved = await Filesystem.writeFile({
          path: `Ajwibah/${img.filename}`,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });
        setImageFeedback(`تصویر با موفقیت در پوشه Documents/Ajwibah ذخیره شد.`);
        setTimeout(() => setImageFeedback(null), 3500);
        return saved.uri;
      } catch {
        // Fallback to cache + native share save dialog
        try {
          const base64Data = img.dataUrl.split(',')[1] || '';
          const cached = await Filesystem.writeFile({
            path: img.filename,
            data: base64Data,
            directory: Directory.Cache,
          });
          await Share.share({
            title: `ذخیره تصویر استفتاء ${toPersianDigits(item.id)}`,
            files: [cached.uri],
          });
          return cached.uri;
        } catch {
          setImageFeedback('خطا در ذخیره تصویر در دستگاه.');
          return null;
        }
      }
    }

    const url = URL.createObjectURL(img.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = img.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setImageFeedback('تصویر استفتاء در دستگاه شما ذخیره شد.');
    setTimeout(() => setImageFeedback(null), 2500);
    return null;
  };

  const handleImageShare = async () => {
    const img = imageState.result;
    if (!img) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = img.dataUrl.split(',')[1] || '';
        const cached = await Filesystem.writeFile({
          path: img.filename,
          data: base64Data,
          directory: Directory.Cache,
        });
        await Share.share({
          title: `استفتاء شماره ${toPersianDigits(item.id)} — اجوبة‌الاستفتائات`,
          files: [cached.uri],
        });
        return;
      } catch (err) {
        if (err instanceof Error && /cancel/i.test(err.message)) return;
      }
    }

    const file = new File([img.blob], img.filename, {type: 'image/png'});
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (typeof nav.share === 'function' && nav.canShare?.({files: [file]})) {
      try {
        await nav.share({
          files: [file],
          title: `استفتاء شماره ${toPersianDigits(item.id)} — اجوبة‌الاستفتائات`,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    await downloadImage(img);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#FFFDF8] dark:bg-[#191D21] border border-[#E2D9C8] dark:border-[#2D333A] rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <div className="px-5 py-3.5 border-b border-[#E2D9C8] dark:border-[#2D333A] flex items-center justify-between bg-[#F8F5EE] dark:bg-[#22272C]">
          <h3 id="share-modal-title" className="text-sm font-bold text-[#1C1917] dark:text-[#F4EFE6]">
            اشتراک‌گذاری استفتاء {toPersianDigits(item.id)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره اشتراک‌گذاری"
            className="p-1 text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F4EFE6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {personalNoteText && (
            <label className="flex items-center gap-2 text-xs text-[#1C1917] dark:text-[#F4EFE6] cursor-pointer">
              <input
                type="checkbox"
                checked={includeNote}
                onChange={e => setIncludeNote(e.target.checked)}
                className="accent-[#0E5C31] dark:accent-[#2DD4BF] w-4 h-4"
              />
              <span>افزودن یادداشت شخصی من به متن و تصویر اشتراک‌گذاری</span>
            </label>
          )}

          {/* Text Share Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                اشتراک‌گذاری متنی
              </span>
              <button
                type="button"
                onClick={copyText}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-[#0E5C31] hover:bg-[#0A4624] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'متن کپی شد!' : 'کپی متن استفتاء'}</span>
              </button>
            </div>
            <pre className="p-3 text-xs leading-6 bg-[#F8F5EE] dark:bg-[#111315] border border-[#E2D9C8] dark:border-[#2D333A] rounded-md max-h-36 overflow-y-auto whitespace-pre-wrap font-body text-[#292524] dark:text-[#E7E5E4]">
              {formattedText}
            </pre>
          </div>

          {/* Image Share Block */}
          <div className="pt-3 border-t border-[#E2D9C8] dark:border-[#2D333A] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4EFE6]">
                <ImageIcon className="w-4 h-4 text-[#9A6B25] dark:text-[#D4AF37]" />
                <span>اشتراک‌گذاری تصویری (کارت گرافیکی استفتاء)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!imageState.result}
                  onClick={handleImageShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0E5C31] hover:bg-[#0A4624] text-white dark:bg-[#2DD4BF] dark:hover:bg-[#22B8A4] dark:text-[#111315] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>اشتراک‌گذاری تصویر</span>
                </button>

                <button
                  type="button"
                  disabled={!imageState.result}
                  onClick={() => imageState.result && downloadImage(imageState.result)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#F8F5EE] dark:bg-[#22272C] border border-[#D6CEBE] dark:border-[#2D333A] hover:border-[#0E5C31] text-[#1C1917] dark:text-[#F4EFE6] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ذخیره تصویر</span>
                </button>
              </div>
            </div>

            {imageFeedback && (
              <div className="p-2.5 text-xs rounded-md bg-[#0E5C31]/10 border border-[#0E5C31]/30 text-[#0E5C31] dark:text-[#2DD4BF]">
                {imageFeedback}
              </div>
            )}

            <div className="bg-[#EFE9DC]/60 dark:bg-[#111315] border border-[#E2D9C8] dark:border-[#2D333A] rounded-md p-3 flex items-center justify-center min-h-48">
              {imageState.loading ? (
                <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  در حال آماده‌سازی تصویر استفتاء...
                </span>
              ) : imageState.error ? (
                <span className="text-xs text-[#9A3412] dark:text-[#FCA5A5]">
                  {imageState.error}
                </span>
              ) : imageState.result ? (
                <img
                  src={imageState.result.dataUrl}
                  alt={`کارت تصویری استفتاء شماره ${toPersianDigits(item.id)}`}
                  className="max-h-72 w-auto rounded-md shadow-sm border border-[#D6CEBE] dark:border-[#2D333A]"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
