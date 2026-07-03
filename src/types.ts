export interface Paragraph {
  text: string;
  index: number;
}

export interface Chapter {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  chapters: Chapter[];
  coverColor: string; // Tailwind bg color class
  isCustom?: boolean;
  createdAt?: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  chapterId: string;
  paragraphIndex: number;
  annotation?: string;
  color: 'yellow' | 'green' | 'pink' | 'blue';
  createdAt: string;
}

export interface ReadingSettings {
  theme: 'light' | 'dark' | 'sepia' | 'emerald';
  fontSize: number; // in px, e.g. 16, 18, 20, 22, 24
  fontFamily: 'serif' | 'sans' | 'mono' | 'dyslexic';
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export interface SearchMatch {
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  paragraphIndex: number;
  text: string;
  before: string;
  match: string;
  after: string;
}
