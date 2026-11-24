import type {IstiftaItem} from '../types/book.ts';
import {toPersianDigits} from './persian.ts';

export interface GeneratedShareImage {
  dataUrl: string;
  blob: Blob;
  filename: string;
}

const LOGO_URL = `${import.meta.env.BASE_URL}assets/aistudio/a______________________11e307c1.webp`;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapRtlLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateQuestionShareImage(
  item: IstiftaItem,
  chapterTitle: string,
  subtopicTitle: string,
  personalNote?: string,
): Promise<GeneratedShareImage> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const logoImg = await loadImage(LOGO_URL);

  const width = 1080;
  const padX = 72;
  const contentWidth = width - padX * 2;
  const headerHeight = 230;
  const footerHeight = 115;

  // Offscreen canvas for accurate text measurement
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d')!;
  mCtx.direction = 'rtl';

  const qFont = '600 32px Vazirmatn, Tahoma, sans-serif';
  const aFont = '400 30px Vazirmatn, Tahoma, sans-serif';
  const noteFont = '400 26px Vazirmatn, Tahoma, sans-serif';

  mCtx.font = qFont;
  const qLines = wrapRtlLines(mCtx, item.question, contentWidth - 48);

  mCtx.font = aFont;
  const aLines = wrapRtlLines(mCtx, item.answer, contentWidth - 48);

  const hasNote = Boolean(personalNote && personalNote.trim());
  let noteLines: string[] = [];
  if (hasNote) {
    mCtx.font = noteFont;
    noteLines = wrapRtlLines(mCtx, personalNote!.trim(), contentWidth - 72);
  }

  const qLineH = 54;
  const aLineH = 52;
  const noteLineH = 44;

  const qBlockH = 52 + qLines.length * qLineH + 24;
  const aBlockH = 52 + aLines.length * aLineH + 24;
  const noteBlockH = hasNote ? 74 + noteLines.length * noteLineH + 28 : 0;

  const bodyPaddingTop = 46;
  const bodyPaddingBottom = 38;
  const height = Math.max(
    920,
    headerHeight + bodyPaddingTop + qBlockH + 28 + aBlockH + (hasNote ? 28 + noteBlockH : 0) + bodyPaddingBottom + footerHeight,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = 'rtl';

  // Archival warm parchment background
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative gold border frame
  ctx.strokeStyle = '#C9A45C';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Deep forest green header banner matching attached logo
  const headerGrad = ctx.createLinearGradient(0, 0, width, headerHeight);
  headerGrad.addColorStop(0, '#0B4624');
  headerGrad.addColorStop(1, '#126134');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, headerHeight);

  // Gold hairline accent under header
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(0, headerHeight - 5, width, 5);

  // Draw attached logo on right side of header
  if (logoImg) {
    const logoSize = 148;
    const logoX = width - padX - logoSize;
    const logoY = (headerHeight - logoSize) / 2;
    ctx.save();
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 28);
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 28);
    ctx.stroke();
  }

  // Header titles
  const titleRight = width - padX - (logoImg ? 176 : 0);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F3DF9E';
  ctx.font = '700 44px Amiri, Vazirmatn, serif';
  ctx.fillText('اجوبة‌الاستفتائات', titleRight, 86);

  ctx.fillStyle = '#F8F5EE';
  ctx.font = '600 28px Vazirmatn, sans-serif';
  ctx.fillText(`استفتاء شماره ${toPersianDigits(item.id)}`, titleRight, 138);

  ctx.fillStyle = 'rgba(248, 245, 238, 0.85)';
  ctx.font = '400 22px Vazirmatn, sans-serif';
  const metaLine = `${chapterTitle} · ${subtopicTitle} · صفحه ${toPersianDigits(item.page)}`;
  const trimmedMeta =
    ctx.measureText(metaLine).width > titleRight - padX
      ? `${chapterTitle} · صفحه ${toPersianDigits(item.page)}`
      : metaLine;
  ctx.fillText(trimmedMeta, titleRight, 182);

  // Body content
  let cursorY = headerHeight + bodyPaddingTop;

  // Question section
  ctx.fillStyle = '#9A6B25';
  ctx.font = '700 28px Amiri, Vazirmatn, serif';
  ctx.fillText('سؤال:', width - padX, cursorY);
  cursorY += 48;

  ctx.fillStyle = '#1C1917';
  ctx.font = qFont;
  for (const line of qLines) {
    if (line) ctx.fillText(line, width - padX - 12, cursorY);
    cursorY += qLineH;
  }

  cursorY += 16;

  // Divider line
  ctx.strokeStyle = '#D6CEBE';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, cursorY);
  ctx.lineTo(width - padX, cursorY);
  ctx.stroke();
  cursorY += 42;

  // Answer section
  ctx.fillStyle = '#0E5C31';
  ctx.font = '700 28px Amiri, Vazirmatn, serif';
  ctx.fillText('پاسخ:', width - padX, cursorY);
  cursorY += 48;

  ctx.fillStyle = '#292524';
  ctx.font = aFont;
  for (const line of aLines) {
    if (line) ctx.fillText(line, width - padX - 12, cursorY);
    cursorY += aLineH;
  }

  // Optional Personal Note Box
  if (hasNote) {
    cursorY += 20;
    const boxY = cursorY;
    const boxH = 66 + noteLines.length * noteLineH;
    ctx.fillStyle = '#EFE9DC';
    drawRoundedRect(ctx, padX, boxY, contentWidth, boxH, 14);
    ctx.fill();
    ctx.strokeStyle = '#C9A45C';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#9A6B25';
    ctx.font = '700 24px Vazirmatn, sans-serif';
    ctx.fillText('یادداشت شخصی:', width - padX - 24, boxY + 42);

    ctx.fillStyle = '#292524';
    ctx.font = noteFont;
    let noteY = boxY + 84;
    for (const line of noteLines) {
      if (line) ctx.fillText(line, width - padX - 24, noteY);
      noteY += noteLineH;
    }
  }

  // Footer
  const footerY = height - footerHeight;
  ctx.fillStyle = '#EFE9DC';
  ctx.fillRect(26, footerY, width - 52, footerHeight - 26);

  ctx.strokeStyle = '#D6CEBE';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(26, footerY);
  ctx.lineTo(width - 26, footerY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0E5C31';
  ctx.font = '700 24px Vazirmatn, sans-serif';
  ctx.fillText(
    'اجوبة‌الاستفتائات — شهید آیت‌الله سید علی خامنه‌ای (قدس‌الله‌نفسه‌الزکیه)',
    width / 2,
    footerY + 52,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => {
      if (b) resolve(b);
      else reject(new Error('خطا در تولید تصویر استفتاء'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    blob,
    filename: `istifta-${item.id}.png`,
  };
}
