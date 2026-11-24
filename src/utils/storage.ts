import type {
  BookmarkEntry,
  NoteEntry,
  UserDataBackup,
  UserPreferences,
} from '../types/book.ts';

const KEYS = {
  bookmarks: 'ajwibah_bookmarks_v1',
  notes: 'ajwibah_notes_v1',
  subtopics: 'ajwibah_subtopics_v1',
  prefs: 'ajwibah_prefs_v1',
} as const;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadBookmarks(): BookmarkEntry[] {
  return safeReadJson<BookmarkEntry[]>(KEYS.bookmarks, []);
}

export function saveBookmarks(items: BookmarkEntry[]): void {
  safeWriteJson(KEYS.bookmarks, items);
}

export function loadNotes(): NoteEntry[] {
  return safeReadJson<NoteEntry[]>(KEYS.notes, []);
}

export function saveNotes(items: NoteEntry[]): void {
  safeWriteJson(KEYS.notes, items);
}

export function loadBookmarkedSubtopics(): string[] {
  return safeReadJson<string[]>(KEYS.subtopics, []);
}

export function saveBookmarkedSubtopics(ids: string[]): void {
  safeWriteJson(KEYS.subtopics, ids);
}

export function loadPreferences(): UserPreferences {
  return safeReadJson<UserPreferences>(KEYS.prefs, {
    theme: 'light',
    fontScale: 'md',
  });
}

export function savePreferences(prefs: UserPreferences): void {
  safeWriteJson(KEYS.prefs, prefs);
}

export function buildBackupPayload(
  bookmarks: BookmarkEntry[],
  notes: NoteEntry[],
  bookmarkedSubtopics: string[],
): UserDataBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bookmarks,
    notes,
    bookmarkedSubtopics,
  };
}

export function parseBackupPayload(jsonText: string): UserDataBackup {
  const parsed = JSON.parse(jsonText) as Partial<UserDataBackup>;
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray(parsed.bookmarks) ||
    !Array.isArray(parsed.notes)
  ) {
    throw new Error('ساختار فایل پشتیبان معتبر نیست.');
  }

  const validBookmarks: BookmarkEntry[] = parsed.bookmarks
    .filter(
      (b): b is BookmarkEntry =>
        Boolean(b) && typeof b.questionId === 'number' && b.questionId >= 1 && b.questionId <= 2118,
    )
    .map(b => ({
      questionId: b.questionId,
      important: Boolean(b.important),
      category: typeof b.category === 'string' && b.category.trim() ? b.category.trim() : 'عمومی',
      createdAt: typeof b.createdAt === 'string' ? b.createdAt : new Date().toISOString(),
    }));

  const validNotes: NoteEntry[] = parsed.notes
    .filter(
      (n): n is NoteEntry =>
        Boolean(n) &&
        typeof n.questionId === 'number' &&
        n.questionId >= 1 &&
        n.questionId <= 2118 &&
        typeof n.text === 'string' &&
        n.text.trim().length > 0,
    )
    .map(n => ({
      questionId: n.questionId,
      text: n.text.trim(),
      updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : new Date().toISOString(),
    }));

  const validSubtopics = Array.isArray(parsed.bookmarkedSubtopics)
    ? parsed.bookmarkedSubtopics.filter((s): s is string => typeof s === 'string')
    : [];

  return {
    version: 1,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    bookmarks: validBookmarks,
    notes: validNotes,
    bookmarkedSubtopics: validSubtopics,
  };
}
