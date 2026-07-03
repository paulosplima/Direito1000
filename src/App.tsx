import React, { useState, useEffect, useRef } from 'react';
import { Book, Highlight, SearchMatch } from './types';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import BookUploader from './components/BookUploader';
import SearchPanel from './components/SearchPanel';
import TTSPlayer from './components/TTSPlayer';
import { 
  Menu, X, Search, Shield, BookOpen, Volume2, Globe, Plus, 
  ExternalLink, Bookmark, HelpCircle, ArrowLeft, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Library Catalog State
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookId, setActiveBookId] = useState<string>('cf88');
  const [activeChapterId, setActiveChapterId] = useState<string>('cf88-cap1');
  
  // Custom Annotation Markers State
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Layout Drawers state
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // Jump Locations for search scrolling
  const [targetParagraphIndex, setTargetParagraphIndex] = useState<number | null>(null);

  // TTS Engine State
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [activeTTSParagraphIndex, setActiveTTSParagraphIndex] = useState<number | null>(null);
  const [activeTTSChapterId, setActiveTTSChapterId] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const activeBook = books.find((b) => b.id === activeBookId) || books[0] || DEFAULT_BOOKS[0];

  // Ref to hold current utterance for reliable control
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 1. Initial State Syncing
  useEffect(() => {
    // Load custom books from local storage
    const storedBooksStr = localStorage.getItem('direito_total_custom_books');
    const storedBooks = storedBooksStr ? JSON.parse(storedBooksStr) : [];
    
    // Combine pre-seeded defaults + custom
    const combined = [...DEFAULT_BOOKS, ...storedBooks];
    setBooks(combined);

    // Initial Active setup
    if (combined.length > 0) {
      setActiveBookId(combined[0].id);
      if (combined[0].chapters && combined[0].chapters.length > 0) {
        setActiveChapterId(combined[0].chapters[0].id);
      }
    }

    // Load Highlights / Notes
    const storedHighlights = localStorage.getItem('direito_total_highlights');
    if (storedHighlights) {
      setHighlights(JSON.parse(storedHighlights));
    }
  }, []);

  // 2. Load TTS Voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Auto-select first Portuguese voice if not chosen
        const storedVoiceURI = localStorage.getItem('direito_total_tts_voice_uri');
        const defaultPt = voices.find(v => v.lang.toLowerCase().startsWith('pt'));
        
        if (storedVoiceURI) {
          const matched = voices.find(v => v.voiceURI === storedVoiceURI);
          if (matched) setSelectedVoice(matched);
          else if (defaultPt) setSelectedVoice(defaultPt);
        } else if (defaultPt) {
          setSelectedVoice(defaultPt);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 3. Sync changes to local storage
  const handleAddBook = (newBook: Book) => {
    // Save to custom list
    const storedBooksStr = localStorage.getItem('direito_total_custom_books');
    const customList = storedBooksStr ? JSON.parse(storedBooksStr) : [];
    const updatedCustomList = [newBook, ...customList];
    localStorage.setItem('direito_total_custom_books', JSON.stringify(updatedCustomList));

    // Update state
    setBooks((prev) => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    if (newBook.chapters.length > 0) {
      setActiveChapterId(newBook.chapters[0].id);
    }
    setIsUploaderOpen(false);
    setIsSidebarOpenMobile(false);
  };

  const handleDeleteBook = (id: string) => {
    // Remove from custom local storage
    const storedBooksStr = localStorage.getItem('direito_total_custom_books');
    const customList = storedBooksStr ? JSON.parse(storedBooksStr) : [];
    const updatedCustomList = customList.filter((b: any) => b.id !== id);
    localStorage.setItem('direito_total_custom_books', JSON.stringify(updatedCustomList));

    // Filter state
    const filtered = books.filter((b) => b.id !== id);
    setBooks(filtered);

    // If active was deleted, fall back
    if (activeBookId === id && filtered.length > 0) {
      setActiveBookId(filtered[0].id);
      if (filtered[0].chapters.length > 0) {
        setActiveChapterId(filtered[0].chapters[0].id);
      }
    }
    handleStopTTS();
  };

  const handleAddHighlight = (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `hl-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Filter out existing highlight on same paragraph if it exists to override
    const filtered = highlights.filter(
      (h) => !(h.bookId === highlight.bookId && h.chapterId === highlight.chapterId && h.paragraphIndex === highlight.paragraphIndex)
    );

    const updated = [newHighlight, ...filtered];
    setHighlights(updated);
    localStorage.setItem('direito_total_highlights', JSON.stringify(updated));
  };

  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    localStorage.setItem('direito_total_highlights', JSON.stringify(updated));
  };

  const handleSelectBook = (bookId: string) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (targetBook) {
      setActiveBookId(bookId);
      if (targetBook.chapters.length > 0) {
        setActiveChapterId(targetBook.chapters[0].id);
      }
      setIsSidebarOpenMobile(false);
      handleStopTTS();
    }
  };

  // 4. Text-To-Speech (Leitura em Voz Alta) Engine Implementation
  const handlePlayParagraph = (chapterId: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 1. Cancel previous reading
    window.speechSynthesis.cancel();

    const chapter = activeBook.chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return;

    const textToSpeak = chapter.paragraphs[index];
    if (!textToSpeak) return;

    // 2. Set Active speech track
    setActiveTTSChapterId(chapterId);
    setActiveTTSParagraphIndex(index);
    setIsPlayingTTS(true);

    // 3. Create Speech Utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Configure Voice and Speed rate
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = ttsRate;
    utterance.lang = selectedVoice?.lang || 'pt-BR';

    // 4. Register event handlers
    utterance.onend = () => {
      // Hands-free continuous reading! Auto-advances to the next paragraph
      if (index < chapter.paragraphs.length - 1) {
        // Brief pleasant delay before launching the next paragraph
        setTimeout(() => {
          handlePlayParagraph(chapterId, index + 1);
        }, 350);
      } else {
        handleStopTTS();
      }
    };

    utterance.onerror = (e) => {
      // If speech was cancelled manually, do not reset everything since we might be loading next track
      if (e.error !== 'interrupted') {
        handleStopTTS();
      }
    };

    // Speak!
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPauseTTS = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingTTS) {
      window.speechSynthesis.pause();
      setIsPlayingTTS(false);
    } else {
      if (activeTTSParagraphIndex !== null && activeTTSChapterId !== null) {
        window.speechSynthesis.resume();
        setIsPlayingTTS(true);
      } else {
        // Start from beginning of current active chapter
        handlePlayParagraph(activeChapterId, 0);
      }
    }
  };

  const handlePauseTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPlayingTTS(false);
    }
  };

  const handleResumeTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPlayingTTS(true);
    }
  };

  const handleStopTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
    setActiveTTSParagraphIndex(null);
    setActiveTTSChapterId(null);
    utteranceRef.current = null;
  };

  const handleNextParagraphTTS = () => {
    const chapter = activeBook.chapters.find((ch) => ch.id === activeChapterId);
    if (!chapter) return;

    const currentIdx = activeTTSParagraphIndex !== null ? activeTTSParagraphIndex : -1;
    if (currentIdx < chapter.paragraphs.length - 1) {
      handlePlayParagraph(activeChapterId, currentIdx + 1);
    }
  };

  const handlePrevParagraphTTS = () => {
    const currentIdx = activeTTSParagraphIndex !== null ? activeTTSParagraphIndex : 1;
    if (currentIdx > 0) {
      handlePlayParagraph(activeChapterId, currentIdx - 1);
    }
  };

  const handleRateChange = (newRate: number) => {
    setTtsRate(newRate);
    // Restart active reading with the new rate if currently speaking
    if (isPlayingTTS && activeTTSChapterId && activeTTSParagraphIndex !== null) {
      handlePlayParagraph(activeTTSChapterId, activeTTSParagraphIndex);
    }
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    localStorage.setItem('direito_total_tts_voice_uri', voice.voiceURI);
    // Restart active reading with the new voice if currently speaking
    if (isPlayingTTS && activeTTSChapterId && activeTTSParagraphIndex !== null) {
      handlePlayParagraph(activeTTSChapterId, activeTTSParagraphIndex);
    }
  };

  // Jump straight to location (e.g. from Search matching or Notes lists)
  const handleJumpToLocation = (chapterId: string, paragraphIndex: number) => {
    setActiveChapterId(chapterId);
    setTargetParagraphIndex(paragraphIndex);
    setIsSearchOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A0A0A] font-sans text-[#E0E0E0]">
      
      {/* Upper header with burger controls for mobile responsive drawers */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0F0F0F] border-b border-[#2A2A2A] text-[#E0E0E0] shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            className="p-1.5 rounded-lg hover:bg-[#1A1A1A] text-[#AAA] hover:text-[#D4AF37]"
            title="Menu Biblioteca"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D4AF37] flex items-center justify-center rounded-sm font-serif font-bold text-xs text-[#0A0A0A]">DT</div>
            <span className="font-serif tracking-tight text-sm text-[#D4AF37]">Direito Total</span>
          </div>
        </div>

        {/* Search header trigger */}
        <div className="flex items-center gap-1.5">
          <button
            id="mobile-search-toggle-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-lg transition-colors ${isSearchOpen ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'hover:bg-[#1A1A1A] text-[#AAA] hover:text-[#D4AF37]'}`}
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Layout Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Catalog Overlay Sidebar Drawer */}
        <AnimatePresence>
          {isSidebarOpenMobile && (
            <>
              <motion.div
                id="sidebar-drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black z-40"
                onClick={() => setIsSidebarOpenMobile(false)}
              />
              <motion.div
                id="sidebar-drawer-content"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#0D0D0D] z-50 flex flex-col h-full shadow-2xl border-r border-[#2A2A2A]"
              >
                <div className="flex justify-end p-3 border-b border-[#2A2A2A] bg-[#0F0F0F]">
                  <button
                    id="close-mobile-sidebar-btn"
                    onClick={() => setIsSidebarOpenMobile(false)}
                    className="p-1.5 rounded-lg bg-[#1A1A1A] text-[#AAA] hover:text-white border border-[#2A2A2A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Sidebar
                    books={books}
                    activeBookId={activeBookId}
                    onSelectBook={handleSelectBook}
                    onOpenUploader={() => { setIsUploaderOpen(true); setIsSidebarOpenMobile(false); }}
                    onDeleteBook={handleDeleteBook}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Permanent Catalog Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar
            books={books}
            activeBookId={activeBookId}
            onSelectBook={handleSelectBook}
            onOpenUploader={() => setIsUploaderOpen(true)}
            onDeleteBook={handleDeleteBook}
          />
        </div>

        {/* Central Book Reader Workspace */}
        <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-[#080808]">
          
          {/* Quick Header info banner on Desktop */}
          <div className="hidden lg:flex px-6 py-3.5 bg-[#0A0A0A]/85 border-b border-[#1A1A1A] items-center justify-between text-xs text-[#666]">
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider uppercase text-[10px] text-[#555]">Hospedado em:</span>
              <a 
                href="https://www.matchin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#D4AF37] hover:text-[#B8962D] font-serif font-bold hover:underline inline-flex items-center gap-1 transition-colors"
              >
                www.matchin.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Inline search bar toggle */}
            <button
              id="desktop-search-toggle-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSearchOpen 
                  ? 'bg-[#D4AF37] text-[#0A0A0A] border-transparent shadow-lg shadow-[#D4AF37]/10' 
                  : 'border-[#333] hover:border-[#D4AF37]/50 text-[#AAA] hover:text-[#D4AF37] bg-[#1A1A1A]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchOpen ? 'Fechar Busca' : 'Buscar no Livro'}</span>
            </button>
          </div>

          <div className="flex-1 h-full overflow-hidden">
            {books.length > 0 ? (
              <Reader
                book={activeBook}
                activeChapterId={activeChapterId}
                onChangeChapter={setActiveChapterId}
                highlights={highlights}
                onAddHighlight={handleAddHighlight}
                onDeleteHighlight={handleDeleteHighlight}
                isPlayingTTS={isPlayingTTS}
                activeTTSParagraphIndex={activeTTSParagraphIndex}
                activeTTSChapterId={activeTTSChapterId}
                onPlayParagraph={handlePlayParagraph}
                onPauseTTS={handlePauseTTS}
                onResumeTTS={handleResumeTTS}
                onStopTTS={handleStopTTS}
                targetParagraphIndex={targetParagraphIndex}
                onClearTargetParagraph={() => setTargetParagraphIndex(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mb-4 stroke-1" />
                <p>Nenhum livro jurídico carregado ainda.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right sliding Search Drawer (Desktop / Mobile responsive) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              id="search-drawer-container"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="fixed inset-y-0 right-0 lg:static z-40 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col max-w-[85vw] shadow-2xl lg:shadow-none"
            >
              <SearchPanel
                activeBook={activeBook}
                onJumpToLocation={handleJumpToLocation}
                onClose={() => setIsSearchOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Search Overlay shadow background */}
        {isSearchOpen && (
          <div
            id="mobile-search-backdrop"
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-30"
            onClick={() => setIsSearchOpen(false)}
          />
        )}
      </div>

      {/* Floating Global TTS Media Player Controller */}
      <AnimatePresence>
        {(activeTTSParagraphIndex !== null || isPlayingTTS) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="z-50"
          >
            <TTSPlayer
              activeBook={activeBook}
              activeChapterId={activeTTSChapterId || activeChapterId}
              activeParagraphIndex={activeTTSParagraphIndex !== null ? activeTTSParagraphIndex : 0}
              isPlaying={isPlayingTTS}
              onPlayPause={handlePlayPauseTTS}
              onStop={handleStopTTS}
              onNextParagraph={handleNextParagraphTTS}
              onPrevParagraph={handlePrevParagraphTTS}
              rate={ttsRate}
              onRateChange={handleRateChange}
              selectedVoice={selectedVoice}
              onVoiceChange={handleVoiceChange}
              availableVoices={availableVoices}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Book Overlay Modal */}
      {isUploaderOpen && (
        <BookUploader
          onAddBook={handleAddBook}
          onClose={() => setIsUploaderOpen(false)}
        />
      )}
    </div>
  );
}
