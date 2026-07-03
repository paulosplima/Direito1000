import React, { useState } from 'react';
import { Book } from '../types';
import { BookOpen, Search, Plus, Trash2, Shield, Layers, Compass, Globe, ExternalLink } from 'lucide-react';

interface SidebarProps {
  books: Book[];
  activeBookId: string;
  onSelectBook: (id: string) => void;
  onOpenUploader: () => void;
  onDeleteBook?: (id: string) => void;
}

export default function Sidebar({ books, activeBookId, onSelectBook, onOpenUploader, onDeleteBook }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique categories
  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <aside id="app-sidebar" className="w-full lg:w-80 flex flex-col bg-[#0D0D0D] border-r border-[#2A2A2A] text-[#E0E0E0] shrink-0 h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center rounded-sm shrink-0">
            <span className="text-[#0A0A0A] font-serif font-bold text-xl">DT</span>
          </div>
          <div>
            <h1 className="text-xl font-serif tracking-tight text-[#D4AF37]">Direito Total</h1>
            <span className="text-[9px] text-[#666] tracking-[0.2em] uppercase block font-semibold">matchin.com</span>
          </div>
        </div>
      </div>

      {/* Catalog search */}
      <div className="p-4 border-b border-[#2A2A2A]/40 bg-[#0A0A0A]/30">
        <div className="relative">
          <input
            id="catalog-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar termos ou leis..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#333] bg-[#1A1A1A] text-[#E0E0E0] placeholder-[#555] focus:outline-hidden focus:border-[#D4AF37] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 py-3 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-[#2A2A2A]/40 bg-[#0A0A0A]/45">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`category-btn-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-xs'
                : 'bg-[#1A1A1A] text-[#AAA] border border-[#2A2A2A] hover:text-[#D4AF37] hover:bg-[#222]'
            }`}
          >
            {cat === 'all' ? 'Ver Todos' : cat}
          </button>
        ))}
      </div>

      {/* Book Catalog List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            Biblioteca ({filteredBooks.length})
          </span>
          <button
            id="sidebar-add-book-btn"
            onClick={onOpenUploader}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#B8962D] hover:underline transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Publicar
          </button>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-[#2A2A2A] rounded-lg bg-[#0F0F0F]/20">
            <Compass className="w-6 h-6 text-[#444] mx-auto mb-2" />
            <p className="text-xs text-[#666]">Nenhum livro jurídico correspondente.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredBooks.map((book) => {
              const isActive = book.id === activeBookId;
              return (
                <div
                  key={book.id}
                  className={`group relative flex gap-3 p-3 rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1A1A] border-l-2 border-[#D4AF37] rounded-r-md'
                      : 'hover:bg-[#151515] rounded-md border-l-2 border-transparent'
                  }`}
                  onClick={() => onSelectBook(book.id)}
                >
                  {/* Miniature Cover with gradient */}
                  <div className={`w-10 h-13 rounded-sm shrink-0 bg-gradient-to-br ${book.coverColor} flex flex-col justify-between p-1.5 shadow-md text-[6px] text-white/90 font-bold overflow-hidden border border-white/10`}>
                    <div className="leading-tight truncate">{book.title}</div>
                    <div className="h-0.5 w-4 bg-white/40 rounded-xs"></div>
                    <div className="text-[5px] text-white/60 font-medium truncate">{book.author}</div>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                          isActive
                            ? 'text-[#D4AF37] bg-[#2A2A2A]/80 border border-[#D4AF37]/25'
                            : 'text-[#666] bg-[#0E0E0E] border border-[#222]'
                        }`}>
                          {book.category}
                        </span>
                        {book.isCustom && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500 bg-amber-950/30 border border-amber-900/20 px-1.5 py-0.5 rounded-sm">
                            Customizado
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-serif font-semibold leading-snug truncate ${isActive ? 'text-[#D4AF37]' : 'text-[#AAA] group-hover:text-white'}`}>
                        {book.title}
                      </h4>
                      <p className={`text-[10px] italic truncate mt-0.5 ${isActive ? 'text-[#666]' : 'text-[#444]'}`}>
                        {book.author}
                      </p>
                    </div>
                  </div>

                  {/* Delete button for custom uploaded books */}
                  {book.isCustom && onDeleteBook && (
                    <button
                      id={`delete-book-btn-${book.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir o texto "${book.title}" permanentemente?`)) {
                          onDeleteBook(book.id);
                        }
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded-sm bg-[#0F0F0F] hover:bg-rose-950/80 text-[#555] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-150 border border-[#222]"
                      title="Excluir Texto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Justiniano Quote Section */}
      <div className="pt-4 mt-2 border-t border-[#1A1A1A] px-4 mb-2">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-4 rounded-md border border-[#222]">
          <p className="text-[11px] text-[#888] leading-relaxed italic">
            "A justiça é a vontade constante e perpétua de dar a cada um o seu direito."
          </p>
          <p className="text-[9px] text-[#555] mt-2 uppercase tracking-wider">
            — Justiniano
          </p>
        </div>
      </div>

      {/* Brand Host Footer */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#0A0A0A] text-[#666]">
        <a 
          href="https://www.matchin.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-[#151515] hover:text-[#D4AF37] transition-all text-center group border border-[#1A1A1A]"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#AAA] group-hover:text-[#D4AF37] transition-colors">
            <Globe className="w-3.5 h-3.5 text-[#555] group-hover:text-[#D4AF37]" />
            <span className="font-serif tracking-tight">www.matchin.com</span>
            <ExternalLink className="w-3 h-3 text-[#444] group-hover:text-[#D4AF37]" />
          </div>
          <span className="text-[9px] text-[#444] mt-1 font-sans">
            Hospedagem Oficial &bull; Direito Total &copy; 2026
          </span>
        </a>
      </div>
    </aside>
  );
}
