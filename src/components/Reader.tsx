import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, Highlight, ReadingSettings } from '../types';
import { 
  Play, Pause, Highlighter, Bookmark, ChevronLeft, ChevronRight, 
  Settings, Type, Sparkles, BookOpen, MessageSquare, Save, Trash2, 
  ChevronDown, Search, Check, Volume2, VolumeX, ListCollapse, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReaderProps {
  book: Book;
  activeChapterId: string;
  onChangeChapter: (id: string) => void;
  highlights: Highlight[];
  onAddHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  onDeleteHighlight: (id: string) => void;
  // TTS hooks from App
  isPlayingTTS: boolean;
  activeTTSParagraphIndex: number | null;
  activeTTSChapterId: string | null;
  onPlayParagraph: (chapterId: string, index: number) => void;
  onPauseTTS: () => void;
  onResumeTTS: () => void;
  onStopTTS: () => void;
  // Highlight scrolling indicator
  targetParagraphIndex: number | null;
  onClearTargetParagraph: () => void;
}

export default function Reader({
  book,
  activeChapterId,
  onChangeChapter,
  highlights,
  onAddHighlight,
  onDeleteHighlight,
  isPlayingTTS,
  activeTTSParagraphIndex,
  activeTTSChapterId,
  onPlayParagraph,
  onPauseTTS,
  onResumeTTS,
  onStopTTS,
  targetParagraphIndex,
  onClearTargetParagraph
}: ReaderProps) {
  // Reading Settings
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('direito_total_reader_settings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      fontSize: 18,
      fontFamily: 'serif',
      lineHeight: 'relaxed'
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'highlights' | 'chapters'>('content');
  const [editingParagraphIdx, setEditingParagraphIdx] = useState<number | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<'yellow' | 'green' | 'pink' | 'blue'>('yellow');

  const paragraphRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentChapter = book.chapters.find((ch) => ch.id === activeChapterId) || book.chapters[0];
  const chapterIndex = book.chapters.findIndex((ch) => ch.id === currentChapter.id);

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('direito_total_reader_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle jump scroll to a selected paragraph
  useEffect(() => {
    if (targetParagraphIndex !== null && paragraphRefs.current[targetParagraphIndex]) {
      paragraphRefs.current[targetParagraphIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Flash paragraph briefly
      const el = paragraphRefs.current[targetParagraphIndex];
      if (el) {
        el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2');
        const timer = setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2');
          onClearTargetParagraph();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [targetParagraphIndex, currentChapter.id]);

  const handleNextChapter = () => {
    if (chapterIndex < book.chapters.length - 1) {
      onChangeChapter(book.chapters[chapterIndex + 1].id);
      onStopTTS();
    }
  };

  const handlePrevChapter = () => {
    if (chapterIndex > 0) {
      onChangeChapter(book.chapters[chapterIndex - 1].id);
      onStopTTS();
    }
  };

  const handleHighlightClick = (pIdx: number) => {
    const existing = highlights.find(
      (h) => h.bookId === book.id && h.chapterId === currentChapter.id && h.paragraphIndex === pIdx
    );
    if (existing) {
      setAnnotationText(existing.annotation || '');
      setSelectedHighlightColor(existing.color);
    } else {
      setAnnotationText('');
      setSelectedHighlightColor('yellow');
    }
    setEditingParagraphIdx(editingParagraphIdx === pIdx ? null : pIdx);
  };

  const saveHighlight = (pIdx: number) => {
    onAddHighlight({
      bookId: book.id,
      chapterId: currentChapter.id,
      paragraphIndex: pIdx,
      color: selectedHighlightColor,
      annotation: annotationText.trim() || undefined
    });
    setEditingParagraphIdx(null);
  };

  const deleteHighlightAtParagraph = (pIdx: number) => {
    const existing = highlights.find(
      (h) => h.bookId === book.id && h.chapterId === currentChapter.id && h.paragraphIndex === pIdx
    );
    if (existing) {
      onDeleteHighlight(existing.id);
    }
    setEditingParagraphIdx(null);
  };

  // Get themes styling
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'dark':
        return {
          container: 'bg-[#080808] text-[#E0E0E0] border-[#1A1A1A]',
          paper: 'bg-[#111111] border-[#222222] text-[#C0C0C0] shadow-2xl shadow-black/85',
          settingsPanel: 'bg-[#141414] border-[#222222] text-[#E0E0E0]',
          input: 'bg-[#1A1A1A] border-[#333333] text-[#E0E0E0]',
          btnActive: 'bg-[#D4AF37] text-[#0A0A0A] font-bold',
          btnInactive: 'bg-[#1A1A1A] hover:bg-[#222222] text-[#AAA] hover:text-[#D4AF37]',
          pHighlight: 'text-[#C0C0C0]'
        };
      case 'sepia':
        return {
          container: 'bg-[#FAF6EC] text-[#4F3F2F] border-[#E8DFC2]',
          paper: 'bg-[#FCFAF2] border-[#EADFBD] text-[#423325] shadow-[#E4D7A9]/40',
          settingsPanel: 'bg-[#F2E9CD] border-[#DCD0AA] text-[#423325]',
          input: 'bg-[#FCFAF2] border-[#DCD0AA] text-[#423325]',
          btnActive: 'bg-[#C29B38] text-white',
          btnInactive: 'bg-[#EADFBD] hover:bg-[#DDD0AB] text-[#423325]',
          pHighlight: 'text-[#423325]'
        };
      case 'emerald':
        return {
          container: 'bg-[#0F1E19] text-[#D1E7DD] border-[#1C322B]',
          paper: 'bg-[#152B23] border-[#224035] text-[#E5F5EE] shadow-[#0A1411]',
          settingsPanel: 'bg-[#152B23] border-[#224035] text-[#E5F5EE]',
          input: 'bg-[#0F1E19] border-[#224035] text-[#E5F5EE]',
          btnActive: 'bg-emerald-600 text-white',
          btnInactive: 'bg-[#1C322B] hover:bg-[#28493E] text-emerald-100',
          pHighlight: 'text-[#E5F5EE]'
        };
      case 'light':
      default:
        return {
          container: 'bg-slate-50 text-slate-800 border-slate-200',
          paper: 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50',
          settingsPanel: 'bg-white border-slate-200 text-slate-800',
          input: 'bg-slate-50 border-slate-200 text-slate-800',
          btnActive: 'bg-indigo-600 text-white',
          btnInactive: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
          pHighlight: 'text-slate-800'
        };
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif tracking-normal leading-relaxed';
      case 'mono':
        return 'font-mono tracking-tight text-sm';
      case 'dyslexic':
        return 'font-sans tracking-wide font-medium word-spacing-wide';
      case 'sans':
      default:
        return 'font-sans tracking-normal';
    }
  };

  const getLineHeightClass = () => {
    switch (settings.lineHeight) {
      case 'tight':
        return 'leading-normal';
      case 'relaxed':
        return 'leading-relaxed';
      case 'loose':
        return 'leading-loose';
      case 'normal':
      default:
        return 'leading-medium';
    }
  };

  const themeColors = getThemeClasses();
  const fontStyle = `${getFontFamilyClass()} ${getLineHeightClass()}`;

  const currentChapterHighlights = highlights.filter(
    (h) => h.bookId === book.id && h.chapterId === currentChapter.id
  );

  return (
    <div id="reader-workspace" className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${themeColors.container}`}>
      
      {/* Upper Navigation Bar */}
      <header className="px-5 py-4 border-b flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Lendo agora
            </h2>
            <h1 className="text-sm font-extrabold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {book.title}
            </h1>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Chapter navigation in header */}
          <button
            id="prev-chapter-header-btn"
            onClick={handlePrevChapter}
            disabled={chapterIndex === 0}
            className={`p-1.5 rounded-lg border transition-all ${
              chapterIndex === 0 
                ? 'opacity-30 cursor-not-allowed border-transparent' 
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800'
            }`}
            title="Capítulo Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Chapters Dropdown Indicator */}
          <span className="text-xs font-bold font-mono py-1 px-2.5 rounded-md bg-slate-200/30 dark:bg-slate-800/30">
            {chapterIndex + 1}/{book.chapters.length}
          </span>

          <button
            id="next-chapter-header-btn"
            onClick={handleNextChapter}
            disabled={chapterIndex === book.chapters.length - 1}
            className={`p-1.5 rounded-lg border transition-all ${
              chapterIndex === book.chapters.length - 1 
                ? 'opacity-30 cursor-not-allowed border-transparent' 
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800'
            }`}
            title="Próximo Capítulo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800/80 mx-1 sm:mx-2"></div>

          {/* Settings Trigger */}
          <button
            id="reader-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border transition-all ${
              showSettings 
                ? 'bg-indigo-600 text-white border-transparent' 
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800'
            }`}
            title="Configurações de Leitura"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Tabs bar (Chapters / Highlights / Reader settings) */}
        <div className={`hidden md:flex flex-col w-16 shrink-0 items-center py-4 gap-4 ${
          settings.theme === 'dark' ? 'border-r border-[#1A1A1A] bg-[#0A0A0A]/50' : 'border-r border-slate-200/30 dark:border-slate-800/30 bg-slate-200/10 dark:bg-slate-950/20'
        }`}>
          <button
            id="tab-reader-content"
            onClick={() => setActiveTab('content')}
            className={`p-2.5 rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'content'
                ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-indigo-600 text-white shadow-xs')
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
            title="Texto do Livro"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            id="tab-reader-chapters"
            onClick={() => setActiveTab('chapters')}
            className={`p-2.5 rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'chapters'
                ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-indigo-600 text-white shadow-xs')
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
            title="Índice de Capítulos"
          >
            <ListCollapse className="w-5 h-5" />
          </button>

          <button
            id="tab-reader-highlights"
            onClick={() => setActiveTab('highlights')}
            className={`p-2.5 rounded-lg transition-all relative cursor-pointer ${
              activeTab === 'highlights'
                ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-indigo-600 text-white shadow-xs')
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
            title="Minhas Anotações"
          >
            <Bookmark className="w-5 h-5" />
            {highlights.filter(h => h.bookId === book.id).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                {highlights.filter(h => h.bookId === book.id).length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Sidebar content (Chapters index or Highlights index) */}
        <AnimatePresence>
          {activeTab !== 'content' && (
            <motion.div
              id="reader-sidebar-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`hidden md:flex flex-col shrink-0 h-full overflow-hidden ${
                settings.theme === 'dark' ? 'border-r border-[#1A1A1A] bg-[#0B0B0B]' : 'border-r border-slate-200/30 dark:border-slate-800/30 bg-slate-200/5 dark:bg-slate-950/10'
              }`}
            >
              {activeTab === 'chapters' && (
                <div className="p-4 flex flex-col h-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Capítulos</span>
                    <button onClick={() => setActiveTab('content')} className={`text-[10px] hover:underline ${settings.theme === 'dark' ? 'text-[#D4AF37]' : 'text-indigo-500'}`}>Fechar</button>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        id={`sidebar-chapter-btn-${ch.id}`}
                        onClick={() => onChangeChapter(ch.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                          ch.id === activeChapterId
                            ? (settings.theme === 'dark' ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] font-semibold' : 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold')
                            : 'hover:bg-slate-200/30 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-60 mt-0.5">{idx + 1}.</span>
                        <span>{ch.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'highlights' && (
                <div className="p-4 flex flex-col h-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Minhas Marcações ({highlights.filter(h => h.bookId === book.id).length})</span>
                    <button onClick={() => setActiveTab('content')} className="text-[10px] hover:underline text-indigo-500">Fechar</button>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {highlights.filter(h => h.bookId === book.id).length === 0 ? (
                      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        <Bookmark className="w-5 h-5 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px]">Nenhuma marcação de texto feita neste livro.</p>
                      </div>
                    ) : (
                      highlights
                        .filter(h => h.bookId === book.id)
                        .map((hl) => {
                          const chap = book.chapters.find((c) => c.id === hl.chapterId);
                          const excerpt = chap?.paragraphs[hl.paragraphIndex] || '';
                          
                          // Color matching class
                          const colorClasses = {
                            yellow: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
                            green: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800',
                            pink: 'bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800',
                            blue: 'bg-indigo-100 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800',
                          }[hl.color];

                          return (
                            <div
                              key={hl.id}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] ${colorClasses}`}
                              onClick={() => {
                                if (hl.chapterId !== activeChapterId) {
                                  onChangeChapter(hl.chapterId);
                                }
                                // Set target index to scroll to it
                                setTimeout(() => {
                                  const el = paragraphRefs.current[hl.paragraphIndex];
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add('ring-2', 'ring-indigo-500');
                                    setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500'), 1500);
                                  }
                                }, 100);
                              }}
                            >
                              <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                                <span className="font-semibold truncate max-w-[140px]">
                                  {chap?.title}
                                </span>
                                <span className="font-mono">Pág/Par. {hl.paragraphIndex + 1}</span>
                              </div>
                              <p className="line-clamp-2 italic text-slate-700 dark:text-slate-300 pr-1">
                                &quot;{excerpt}&quot;
                              </p>
                              {hl.annotation && (
                                <div className="mt-2 pt-1.5 border-t border-dashed border-black/5 dark:border-white/5 text-slate-800 dark:text-slate-200">
                                  <p className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Minha Nota:</p>
                                  <p className="font-sans font-medium">{hl.annotation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Book Reader Workspace */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-12 flex justify-center relative">
          
          {/* Book Paper Sheet container */}
          <div className={`w-full max-w-2xl p-6 sm:p-10 md:p-16 rounded-sm border relative transition-all ${themeColors.paper}`}>
            
            {/* Vertical book fold crease line (only on dark theme) */}
            {settings.theme === 'dark' && (
              <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#222222]/60 to-transparent pointer-events-none"></div>
            )}
            
            {/* Corner Ornaments */}
            {settings.theme === 'dark' && (
              <>
                <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-[#D4AF37]/20 pointer-events-none"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-[#D4AF37]/20 pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-[#D4AF37]/20 pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-[#D4AF37]/20 pointer-events-none"></div>
              </>
            )}

            <div className="relative z-10 flex flex-col">
              {/* Book Title Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center mb-8 pb-6 border-b border-dashed ${
                  settings.theme === 'dark' ? 'border-[#222]' : 'border-slate-200/50 dark:border-slate-800/50'
                }`}
              >
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-2 ${
                  settings.theme === 'dark' ? 'bg-[#2A2A2A] text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {book.category}
                </span>
                <h2 className={`text-xl md:text-2xl font-extrabold font-serif mb-2 leading-tight ${
                  settings.theme === 'dark' ? 'text-[#D4AF37]' : ''
                }`}>
                  {currentChapter.title}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Obra por <span className="font-semibold">{book.author}</span>
                </p>
              </motion.div>

              {/* Mobile Bottom Index Button */}
              <div className="flex md:hidden justify-center gap-2 mb-6">
                <button
                  id="mobile-chapter-menu-btn"
                  onClick={() => {
                    const targetTab = activeTab === 'chapters' ? 'content' : 'chapters';
                    setActiveTab(targetTab);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    activeTab === 'chapters'
                      ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A] border-transparent font-bold' : 'bg-indigo-600 text-white border-transparent')
                      : (settings.theme === 'dark' ? 'border-[#333] text-[#AAA] bg-[#1A1A1A]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100')
                  }`}
                >
                  <ListCollapse className="w-3.5 h-3.5" />
                  <span>Índice</span>
                </button>
                <button
                  id="mobile-highlights-menu-btn"
                  onClick={() => {
                    const targetTab = activeTab === 'highlights' ? 'content' : 'highlights';
                    setActiveTab(targetTab);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    activeTab === 'highlights'
                      ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A] border-transparent font-bold' : 'bg-indigo-600 text-white border-transparent')
                      : (settings.theme === 'dark' ? 'border-[#333] text-[#AAA] bg-[#1A1A1A]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100')
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Notas ({highlights.filter(h => h.bookId === book.id).length})</span>
                </button>
              </div>

              {/* Mobile view side-panels */}
              {activeTab === 'chapters' && (
                <div className={`md:hidden mb-6 p-4 rounded-xl border ${
                  settings.theme === 'dark' ? 'border-[#222] bg-[#151515]/60' : 'border-slate-200/50 bg-slate-100/40 dark:bg-slate-900/40'
                }`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Capítulos</h3>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        onClick={() => { onChangeChapter(ch.id); setActiveTab('content'); }}
                        className={`text-left p-2 rounded-lg text-xs flex gap-1.5 cursor-pointer ${
                          ch.id === activeChapterId 
                            ? (settings.theme === 'dark' ? 'bg-[#D4AF37] text-[#0A0A0A] font-bold' : 'bg-indigo-600 text-white font-semibold') 
                            : 'hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-mono">{idx + 1}.</span>
                        <span className="truncate">{ch.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'highlights' && (
                <div className={`md:hidden mb-6 p-4 rounded-xl border ${
                  settings.theme === 'dark' ? 'border-[#222] bg-[#151515]/60' : 'border-slate-200/50 bg-slate-100/40 dark:bg-slate-900/40'
                }`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Minhas Marcações</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto">
                    {highlights.filter(h => h.bookId === book.id).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Nenhuma marcação.</p>
                    ) : (
                      highlights
                        .filter(h => h.bookId === book.id)
                        .map((hl) => {
                          const chap = book.chapters.find((c) => c.id === hl.chapterId);
                          return (
                            <div
                              key={hl.id}
                              onClick={() => {
                                if (hl.chapterId !== activeChapterId) onChangeChapter(hl.chapterId);
                                setActiveTab('content');
                                setTimeout(() => {
                                  paragraphRefs.current[hl.paragraphIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 1500);
                              }}
                              className={`p-2 border rounded-lg text-xs cursor-pointer ${
                                settings.theme === 'dark' ? 'bg-[#1E1E1E] border-[#333]' : 'bg-white dark:bg-slate-950'
                              }`}
                            >
                              <span className="font-bold text-[9px] text-slate-400 block mb-0.5">{chap?.title} - Parágrafo {hl.paragraphIndex + 1}</span>
                              <p className="line-clamp-1 italic text-slate-600 dark:text-slate-400">&quot;{chap?.paragraphs[hl.paragraphIndex]}&quot;</p>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

            {/* Paragraphs Display Reader Content */}
            <div id="book-content-paragraphs" className="space-y-6 md:space-y-8">
              {currentChapter.paragraphs.map((pText, pIdx) => {
                const isTTSActive = 
                  activeTTSParagraphIndex === pIdx && 
                  activeTTSChapterId === currentChapter.id;

                const existingHighlight = currentChapterHighlights.find(
                  (h) => h.paragraphIndex === pIdx
                );

                // Highlight background overlay classes based on saved highlight
                const highlightBgClass = existingHighlight ? {
                  yellow: 'bg-yellow-200/60 dark:bg-yellow-950/50 border-l-4 border-yellow-500',
                  green: 'bg-green-200/60 dark:bg-green-950/50 border-l-4 border-green-500',
                  pink: 'bg-pink-200/60 dark:bg-pink-950/50 border-l-4 border-pink-500',
                  blue: 'bg-blue-200/60 dark:bg-blue-950/50 border-l-4 border-blue-500',
                }[existingHighlight.color] : 'border-l-4 border-transparent';

                return (
                  <div
                    key={pIdx}
                    ref={(el) => { paragraphRefs.current[pIdx] = el; }}
                    id={`p-container-${pIdx}`}
                    className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-300 ${highlightBgClass} ${
                      isTTSActive 
                        ? 'ring-2 ring-indigo-500/80 bg-indigo-500/5 dark:bg-indigo-500/10' 
                        : 'hover:bg-slate-200/20 dark:hover:bg-slate-800/10'
                    }`}
                  >
                    {/* Floating controls for each paragraph on hover/focus */}
                    <div className="absolute right-3 -top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg shadow-md z-10">
                      
                      {/* Play Paragraph TTS */}
                      <button
                        id={`play-p-btn-${pIdx}`}
                        onClick={() => {
                          if (isTTSActive && isPlayingTTS) {
                            onPauseTTS();
                          } else if (isTTSActive && !isPlayingTTS) {
                            onResumeTTS();
                          } else {
                            onPlayParagraph(currentChapter.id, pIdx);
                          }
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isTTSActive 
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Ler parágrafo em voz alta"
                      >
                        {isTTSActive && isPlayingTTS ? (
                          <Pause className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Highlighter trigger */}
                      <button
                        id={`highlight-p-btn-${pIdx}`}
                        onClick={() => handleHighlightClick(pIdx)}
                        className={`p-1 rounded-md transition-colors ${
                          existingHighlight 
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Marcar / Adicionar anotação"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Paragraph Content Text */}
                    <p
                      id={`p-text-${pIdx}`}
                      style={{ fontSize: `${settings.fontSize}px` }}
                      className={`${fontStyle} ${themeColors.pHighlight} selection:bg-indigo-500/30 break-words`}
                    >
                      {pText}
                    </p>

                    {/* Associated Annotation notes bubble */}
                    {existingHighlight?.annotation && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border-l-2 border-indigo-500/40 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 max-w-full overflow-hidden">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Nota Anotada:</p>
                          <p className="font-medium break-words leading-relaxed">{existingHighlight.annotation}</p>
                        </div>
                      </div>
                    )}

                    {/* Inline Annotation Editor Form */}
                    <AnimatePresence>
                      {editingParagraphIdx === pIdx && (
                        <motion.div
                          id={`inline-editor-${pIdx}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3.5 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 shadow-inner space-y-3 overflow-hidden text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Cor do Marcador
                            </span>
                            <div className="flex gap-2">
                              {(['yellow', 'green', 'pink', 'blue'] as const).map((color) => {
                                const btnBg = {
                                  yellow: 'bg-yellow-400',
                                  green: 'bg-emerald-400',
                                  pink: 'bg-rose-400',
                                  blue: 'bg-indigo-400',
                                }[color];

                                return (
                                  <button
                                    key={color}
                                    id={`color-select-btn-${pIdx}-${color}`}
                                    type="button"
                                    onClick={() => setSelectedHighlightColor(color)}
                                    className={`w-5 h-5 rounded-full border border-white/20 transition-all ${btnBg} ${
                                      selectedHighlightColor === color 
                                        ? 'scale-120 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' 
                                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor={`annotation-text-${pIdx}`} className="block font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Escrever Anotação / Comentário Jurídico
                            </label>
                            <input
                              id={`annotation-text-${pIdx}`}
                              type="text"
                              value={annotationText}
                              onChange={(e) => setAnnotationText(e.target.value)}
                              placeholder="Ex: Artigo importante para a petição inicial..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            {existingHighlight ? (
                              <button
                                id={`delete-highlight-btn-${pIdx}`}
                                type="button"
                                onClick={() => deleteHighlightAtParagraph(pIdx)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold border border-rose-200/50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover Marcador</span>
                              </button>
                            ) : (
                              <div />
                            )}

                            <div className="flex gap-2">
                              <button
                                id={`cancel-highlight-btn-${pIdx}`}
                                type="button"
                                onClick={() => setEditingParagraphIdx(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                id={`save-highlight-btn-${pIdx}`}
                                type="button"
                                onClick={() => saveHighlight(pIdx)}
                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Salvar</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Bottom Chapter Navigator Buttons */}
            <div className={`flex justify-between items-center border-t border-dashed mt-10 pt-6 mb-8 ${
              settings.theme === 'dark' ? 'border-[#222]' : 'border-slate-200/50 dark:border-slate-800/50'
            }`}>
              <button
                id="prev-chapter-btn-bottom"
                onClick={handlePrevChapter}
                disabled={chapterIndex === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  chapterIndex === 0
                    ? 'opacity-30 border-transparent cursor-not-allowed text-slate-400'
                    : (settings.theme === 'dark' ? 'border-[#333] text-[#AAA] hover:text-[#D4AF37] hover:bg-[#1A1A1A]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800/50')
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Capítulo Anterior</span>
              </button>

              <button
                id="next-chapter-btn-bottom"
                onClick={handleNextChapter}
                disabled={chapterIndex === book.chapters.length - 1}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chapterIndex === book.chapters.length - 1
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : (settings.theme === 'dark' ? 'text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#B8962D] shadow-lg shadow-[#D4AF37]/15' : 'text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-500/10')
                }`}
              >
                <span>Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Floating Settings Drawer Panel (AnimatePresence) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              id="settings-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                id="settings-panel"
                initial={{ y: -50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: -50, scale: 0.95 }}
                className={`absolute top-4 right-4 p-5 rounded-2xl w-full max-w-[320px] shadow-2xl border ${themeColors.settingsPanel}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/20">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Type className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-[#D4AF37]' : 'text-indigo-500'}`} />
                    Preferências de Leitura
                  </h3>
                  <button
                    id="close-settings-btn"
                    onClick={() => setShowSettings(false)}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      settings.theme === 'dark' 
                        ? 'text-slate-400 hover:text-[#D4AF37] hover:bg-[#222]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Themes */}
                  <div className="space-y-1.5">
                    <span className="block font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">
                      Tema de Visualização
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'light', label: 'Claro' },
                        { id: 'sepia', label: 'Sépea' },
                        { id: 'emerald', label: 'Verde' },
                        { id: 'dark', label: 'Escuro' }
                      ].map((th) => (
                        <button
                          key={th.id}
                          id={`theme-btn-${th.id}`}
                          onClick={() => setSettings({ ...settings, theme: th.id as any })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            settings.theme === th.id
                              ? (settings.theme === 'dark' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-extrabold' : 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold')
                              : (settings.theme === 'dark' ? 'border-[#222] bg-[#1A1A1A] text-slate-400 hover:text-[#D4AF37]' : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950 text-slate-500')
                          }`}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fonts family selection */}
                  <div className="space-y-1.5">
                    <span className="block font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">
                      Tipografia
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'serif', label: 'Serifada (Clássico)' },
                        { id: 'sans', label: 'Sem Serifa (Moderna)' },
                        { id: 'mono', label: 'Monoespaço (Foco)' },
                        { id: 'dyslexic', label: 'Super Legível' }
                      ].map((ft) => (
                        <button
                          key={ft.id}
                          id={`font-btn-${ft.id}`}
                          onClick={() => setSettings({ ...settings, fontFamily: ft.id as any })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            settings.fontFamily === ft.id
                              ? (settings.theme === 'dark' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400')
                              : (settings.theme === 'dark' ? 'border-[#222] bg-[#1A1A1A] text-slate-400 hover:text-[#D4AF37]' : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950 text-slate-500')
                          }`}
                        >
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size controls */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">
                        Tamanho do Texto
                      </span>
                      <span className="font-mono text-[10px] font-bold">
                        {settings.fontSize}px
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="font-decrease-btn"
                        onClick={() => setSettings({ ...settings, fontSize: Math.max(14, settings.fontSize - 2) })}
                        className={`flex-1 py-1 px-3 rounded-lg border text-center text-sm font-bold cursor-pointer transition-all ${
                          settings.theme === 'dark' 
                            ? 'border-[#222] bg-[#1A1A1A] text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850'
                        }`}
                      >
                        A-
                      </button>
                      <button
                        id="font-increase-btn"
                        onClick={() => setSettings({ ...settings, fontSize: Math.min(28, settings.fontSize + 2) })}
                        className={`flex-1 py-1 px-3 rounded-lg border text-center text-sm font-bold cursor-pointer transition-all ${
                          settings.theme === 'dark' 
                            ? 'border-[#222] bg-[#1A1A1A] text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-850'
                        }`}
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* Line Height selection */}
                  <div className="space-y-1.5">
                    <span className="block font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">
                      Espaçamento das Linhas
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'tight', label: 'Compacto' },
                        { id: 'relaxed', label: 'Normal' },
                        { id: 'loose', label: 'Amplo' }
                      ].map((lh) => (
                        <button
                          key={lh.id}
                          id={`lh-btn-${lh.id}`}
                          onClick={() => setSettings({ ...settings, lineHeight: lh.id as any })}
                          className={`py-1 rounded-lg border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            settings.lineHeight === lh.id
                              ? (settings.theme === 'dark' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400')
                              : (settings.theme === 'dark' ? 'border-[#222] bg-[#1A1A1A] text-slate-400 hover:text-[#D4AF37]' : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950 text-slate-500')
                          }`}
                        >
                          {lh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Add CSS variables helper for custom spacing
const styles = `
.word-spacing-wide {
  word-spacing: 0.18em;
  letter-spacing: 0.03em;
}
`;
