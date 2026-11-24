export interface Subtopic {
  id: string;
  chapterId: string;
  title: string;
  startPage: number;
  endPage: number;
  questionCount: number;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  startPage: number;
  endPage: number;
  questionCount: number;
  subtopics: Subtopic[];
}

export interface IstiftaItem {
  id: number;
  page: number;
  chapterId: string;
  subtopicId: string;
  question: string;
  answer: string;
  footnotes: string[];
}

export interface BookMeta {
  title: string;
  author: string;
  totalQuestions: number;
  totalPages: number;
}

export interface BookDataset {
  meta: BookMeta;
  chapters: Chapter[];
  questions: IstiftaItem[];
}

export type SearchMatchMode = 'all' | 'any' | 'exact';
export type SearchScope = 'both' | 'question' | 'answer';
export type RulingFilter =
  | 'all'
  | 'ehtiyat'
  | 'haram'
  | 'jayez'
  | 'batil'
  | 'wajib'
  | 'kaffarah';

export interface SearchOptions {
  query: string;
  matchMode: SearchMatchMode;
  scope: SearchScope;
  chapterIds: string[];
  subtopicId: string | null;
  ruling: RulingFilter;
  onlyBookmarked?: boolean;
  onlyWithNotes?: boolean;
}

export interface BookmarkEntry {
  questionId: number;
  important: boolean;
  category: string;
  createdAt: string;
}

export interface NoteEntry {
  questionId: number;
  text: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark';
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

export interface UserPreferences {
  theme: ThemeMode;
  fontScale: FontScale;
}

export interface UserDataBackup {
  version: 1;
  exportedAt: string;
  bookmarks: BookmarkEntry[];
  notes: NoteEntry[];
  bookmarkedSubtopics: string[];
}
