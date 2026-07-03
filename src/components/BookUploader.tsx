import React, { useState, useRef } from 'react';
import { Book, Chapter } from '../types';
import { Upload, X, FileText, Plus, AlertCircle, HelpCircle, Shield } from 'lucide-react';

interface BookUploaderProps {
  onAddBook: (book: Book) => void;
  onClose: () => void;
}

export default function BookUploader({ onAddBook, onClose }: BookUploaderProps) {
  // Administrator Authentication State
  const [isAuthorized, setIsAuthorized] = useState(() => sessionStorage.getItem('direito_total_admin_auth') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [coverColor, setCoverColor] = useState('from-indigo-600 to-indigo-900');
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (username.trim().toLowerCase() === 'admin' && (password === 'admin' || password === 'admin123')) {
      sessionStorage.setItem('direito_total_admin_auth', 'true');
      setIsAuthorized(true);
    } else {
      setAuthError('Usuário ou senha incorretos para o perfil de Administrador.');
    }
  };

  const colors = [
    { value: 'from-blue-700 to-indigo-900', label: 'Azul Imperial' },
    { value: 'from-amber-700 to-amber-950', label: 'Âmbar Clássico' },
    { value: 'from-emerald-700 to-teal-950', label: 'Verde Esmeralda' },
    { value: 'from-purple-700 to-purple-950', label: 'Roxo Nobre' },
    { value: 'from-rose-700 to-red-950', label: 'Bordô Jurídico' },
    { value: 'from-slate-700 to-slate-900', label: 'Grafite Moderno' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processTextFileContent = (text: string, fileName: string) => {
    // Basic automatic parser for txt files
    // If double newlines exist, parse paragraphs.
    // If lines start with "Capítulo" or "Título" or "Art.", we can try to separate, or just put it under a single general chapter.
    const lines = text.split(/\r?\n/);
    const chapters: Chapter[] = [];
    let currentChapterTitle = 'Conteúdo Principal';
    let currentParagraphs: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect chapter indicators
      if (
        trimmed.toUpperCase().startsWith('CAPÍTULO') || 
        trimmed.toUpperCase().startsWith('TÍTULO') || 
        trimmed.toUpperCase().startsWith('SEÇÃO') ||
        (trimmed.length < 50 && trimmed.match(/^(Capítulo|Capítulo\s+[I|V|X|L|C]+|Título\s+[I|V|X|L|C]+|Art\.\s+\d+)/i))
      ) {
        if (currentParagraphs.length > 0) {
          chapters.push({
            id: `custom-cap-${chapters.length + 1}`,
            title: currentChapterTitle,
            paragraphs: [...currentParagraphs]
          });
          currentParagraphs = [];
        }
        currentChapterTitle = trimmed;
      } else {
        currentParagraphs.push(trimmed);
      }
    });

    if (currentParagraphs.length > 0 || chapters.length === 0) {
      chapters.push({
        id: `custom-cap-${chapters.length + 1}`,
        title: currentChapterTitle,
        paragraphs: currentParagraphs.length > 0 ? currentParagraphs : ['Sem conteúdo.']
      });
    }

    // Attempt to guess title from fileName or first chapter
    const inferredTitle = title || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

    const newBook: Book = {
      id: `custom-${Date.now()}`,
      title: inferredTitle,
      author: author || 'Autor Desconhecido',
      category: category || 'Geral',
      description: description || 'Livro carregado pelo usuário.',
      coverColor,
      chapters,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onAddBook(newBook);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError('');
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (fileType === 'json') {
          // Attempt parsing custom Book json schema
          const parsed = JSON.parse(content);
          if (parsed.title && parsed.chapters && Array.isArray(parsed.chapters)) {
            const newBook: Book = {
              id: `custom-${Date.now()}`,
              title: parsed.title,
              author: parsed.author || 'Autor Desconhecido',
              category: parsed.category || 'Geral',
              description: parsed.description || 'Livro carregado via arquivo JSON.',
              coverColor: parsed.coverColor || coverColor,
              chapters: parsed.chapters.map((ch: any, idx: number) => ({
                id: ch.id || `custom-ch-${idx}`,
                title: ch.title || `Capítulo ${idx + 1}`,
                paragraphs: Array.isArray(ch.paragraphs) ? ch.paragraphs : [String(ch.paragraphs)]
              })),
              isCustom: true,
              createdAt: new Date().toISOString()
            };
            onAddBook(newBook);
          } else {
            setError('Formato JSON inválido. Certifique-se de incluir "title" e "chapters" (como array).');
          }
        } else if (fileType === 'txt') {
          processTextFileContent(content, file.name);
        } else {
          setError('Tipo de arquivo não suportado. Por favor, envie arquivos .txt ou .json.');
        }
      } catch (err) {
        setError('Erro ao ler o arquivo. Certifique-se de que o arquivo está no formato adequado.');
      }
    };

    if (fileType === 'json' || fileType === 'txt') {
      reader.readAsText(file);
    } else {
      setError('Formato de arquivo inválido. Apenas .txt e .json são aceitos.');
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('O título do livro é obrigatório.');
      return;
    }
    if (!pastedText.trim()) {
      setError('O conteúdo do texto/livro não pode estar vazio.');
      return;
    }

    // Split text into paragraphs based on double newlines
    const paragraphs = pastedText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Create a single main chapter with these paragraphs
    const chapter: Chapter = {
      id: `custom-cap-1`,
      title: 'Texto Principal',
      paragraphs
    };

    const newBook: Book = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Desenvolvedor',
      category: category.trim() || 'Geral',
      description: description.trim() || 'Texto publicado pelo desenvolvedor.',
      coverColor,
      chapters: [chapter],
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onAddBook(newBook);
  };

  if (!isAuthorized) {
    return (
      <div id="book-uploader-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div id="admin-login-container" className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in scale-in duration-200">
          {/* Header */}
          <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-serif">
                  Acesso Restrito
                </h2>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Área do Administrador
                </p>
              </div>
            </div>
            <button 
              id="close-login-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form id="admin-login-form" onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-slate-200">
            <p className="text-xs text-slate-400 leading-relaxed">
              Para carregar um novo livro ou texto jurídico na biblioteca, é necessário autenticar-se como **Administrador**.
            </p>

            {authError && (
              <div id="login-error-banner" className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label htmlFor="admin-user" className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
                  Usuário de Administrador
                </label>
                <input
                  id="admin-user"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-slate-100 placeholder-slate-600 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="admin-pass" className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
                  Senha de Acesso
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] text-slate-100 placeholder-slate-600 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                id="cancel-login-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#2A2A2A] text-slate-400 hover:bg-[#1A1A1A] hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="submit-login-btn"
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#B8962D] transition-colors shadow-md shadow-[#D4AF37]/15 cursor-pointer animate-none"
              >
                Entrar
              </button>
            </div>
            
            <div className="text-[10px] text-center text-slate-600 pt-1.5 font-mono border-t border-[#2A2A2A]">
              Credenciais de teste: <span className="text-[#D4AF37]/60">admin / admin</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="book-uploader-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div id="book-uploader-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Publicar Novo Livro ou Texto
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adicione textos à sua biblioteca no Direito Total
            </p>
          </div>
          <button 
            id="close-uploader-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-sm">
          <button
            id="tab-paste-btn"
            onClick={() => { setActiveTab('paste'); setError(''); }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Escrever ou Colar Texto
          </button>
          <button
            id="tab-file-btn"
            onClick={() => { setActiveTab('file'); setError(''); }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Carregar Arquivo (.txt / .json)
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div id="uploader-error-banner" className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'paste' ? (
            <form id="paste-book-form" onSubmit={handlePasteSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="book-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Título do Livro/Texto *
                  </label>
                  <input
                    id="book-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Lei Geral de Licitações (Artigos 1º a 5º)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="book-author" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Autor / Publicador
                  </label>
                  <input
                    id="book-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ex: Dr. Paulo Souza / Congresso"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="book-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Categoria Jurídica
                  </label>
                  <input
                    id="book-category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Administrativo, Penal, Civil"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="book-cover-color" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tema de Capa
                  </label>
                  <select
                    id="book-cover-color"
                    value={coverColor}
                    onChange={(e) => setCoverColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {colors.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="book-desc" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Breve Descrição
                </label>
                <input
                  id="book-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Do que trata este texto? Ex: Disposições fundamentais sobre..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="book-text" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Conteúdo do Texto / Artigos *
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Dica: Deixe uma linha em branco para separar parágrafos
                  </span>
                </div>
                <textarea
                  id="book-text"
                  required
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Cole ou digite aqui seu texto jurídico completo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  id="cancel-paste-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="submit-paste-btn"
                  type="submit"
                  className="px-5 py-2 text-sm rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-600/10"
                >
                  Publicar Texto
                </button>
              </div>
            </form>
          ) : (
            <div id="file-upload-section" className="space-y-5">
              <div
                id="drop-zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 scale-[0.99]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950/50'
                }`}
              >
                <input
                  id="file-upload-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Arraste e solte seu arquivo aqui
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 max-w-sm">
                  Suporta arquivos de texto plano (<span className="font-mono">.txt</span>) ou dados estruturados em formato livro (<span className="font-mono">.json</span>).
                </p>
                <button
                  id="browse-files-btn"
                  type="button"
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  Selecionar no Computador
                </button>
              </div>

              {/* Information about formats */}
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  Instruções de Formatação
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Arquivos de Texto (.txt)
                    </p>
                    <p>Será importado como um único capítulo. Use linhas duplas em branco para separar os parágrafos do seu texto jurídico.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Arquivos JSON (.json)
                    </p>
                    <p>Permite estruturar múltiplos capítulos. O arquivo deve seguir a seguinte estrutura de exemplo:</p>
                  </div>
                </div>

                <pre className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto text-slate-600 dark:text-slate-400 max-h-[160px] border border-slate-200/50 dark:border-slate-800/50">
{`{
  "title": "Minha Lei Personalizada",
  "author": "Dr. Nome do Autor",
  "category": "Administrativo",
  "description": "Uma breve descrição da lei.",
  "chapters": [
    {
      "title": "Capítulo I - Introdução",
      "paragraphs": [
        "Art. 1º Este é o primeiro parágrafo do capítulo...",
        "Art. 2º Segundo parágrafo explicativo..."
      ]
    }
  ]
}`}
                </pre>
              </div>
              
              <div className="flex justify-end pt-1">
                <button
                  id="close-file-uploader-btn"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
