import React, { useState, useEffect } from 'react';
import { Book, SearchMatch } from '../types';
import { Search, X, ChevronRight, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';

interface SearchPanelProps {
  activeBook: Book;
  onJumpToLocation: (chapterId: string, paragraphIndex: number) => void;
  onClose?: () => void;
}

export default function SearchPanel({ activeBook, onJumpToLocation, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 250); // Debounce search

    return () => clearTimeout(timer);
  }, [query, activeBook]);

  const performSearch = () => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) {
      setMatches([]);
      setHasSearched(true);
      return;
    }

    const results: SearchMatch[] = [];

    activeBook.chapters.forEach((chapter) => {
      chapter.paragraphs.forEach((pText, pIdx) => {
        const lowerText = pText.toLowerCase();
        let startIdx = 0;
        
        while (true) {
          const foundIdx = lowerText.indexOf(term, startIdx);
          if (foundIdx === -1) break;

          // Extract snippets around the match
          const snippetStart = Math.max(0, foundIdx - 40);
          const snippetEnd = Math.min(pText.length, foundIdx + term.length + 50);

          const before = (snippetStart > 0 ? '...' : '') + pText.slice(snippetStart, foundIdx);
          const match = pText.slice(foundIdx, foundIdx + term.length);
          const after = pText.slice(foundIdx + term.length, snippetEnd) + (snippetEnd < pText.length ? '...' : '');

          results.push({
            bookId: activeBook.id,
            bookTitle: activeBook.title,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            paragraphIndex: pIdx,
            text: pText,
            before,
            match,
            after
          });

          // Prevent infinite loop by advancing search index
          startIdx = foundIdx + term.length;
          if (startIdx >= pText.length) break;
        }
      });
    });

    setMatches(results);
    setHasSearched(true);
  };

  const handleResultClick = (match: SearchMatch) => {
    onJumpToLocation(match.chapterId, match.paragraphIndex);
  };

  return (
    <div id="search-panel-container" className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 font-sans">
            Buscar no Texto
          </h3>
        </div>
        {onClose && (
          <button
            id="close-search-panel-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite palavras ou frases jurídica..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            autoFocus
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {query && (
            <button
              id="clear-search-query-btn"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 pl-1">
          Buscando em: <span className="font-medium text-slate-500 dark:text-slate-300">{activeBook.title}</span>
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasSearched && (
          <div className="h-40 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
            <p className="text-xs">Digite pelo menos 2 caracteres para iniciar a busca avançada por termos no livro.</p>
          </div>
        )}

        {hasSearched && matches.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum resultado encontrado</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] mx-auto">
              Não encontramos ocorrências de &quot;{query}&quot; neste texto. Tente outro termo jurídico.
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              {matches.length} {matches.length === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}
            </p>

            <div className="space-y-2.5">
              {matches.map((match, idx) => (
                <button
                  key={`${match.chapterId}-${match.paragraphIndex}-${idx}`}
                  id={`search-result-${idx}`}
                  onClick={() => handleResultClick(match)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 transition-all focus:outline-hidden group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 max-w-[160px] truncate">
                      {match.chapterTitle}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                      Parágrafo {match.paragraphIndex + 1}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <span>{match.before}</span>
                    <span className="font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded-xs border-b-2 border-amber-400 dark:border-amber-600">
                      {match.match}
                    </span>
                    <span>{match.after}</span>
                  </p>

                  <div className="flex items-center justify-end text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ir para o texto</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
