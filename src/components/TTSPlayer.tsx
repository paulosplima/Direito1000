import React, { useState, useEffect } from 'react';
import { Book, Chapter } from '../types';
import { 
  Play, Pause, Square, SkipForward, SkipBack, Volume2, 
  Settings, ChevronUp, ChevronDown, Check, Speech, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TTSPlayerProps {
  activeBook: Book;
  activeChapterId: string;
  activeParagraphIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onNextParagraph: () => void;
  onPrevParagraph: () => void;
  // TTS config attributes
  rate: number;
  onRateChange: (newRate: number) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export default function TTSPlayer({
  activeBook,
  activeChapterId,
  activeParagraphIndex,
  isPlaying,
  onPlayPause,
  onStop,
  onNextParagraph,
  onPrevParagraph,
  rate,
  onRateChange,
  selectedVoice,
  onVoiceChange,
  availableVoices
}: TTSPlayerProps) {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const currentChapter = activeBook.chapters.find(ch => ch.id === activeChapterId) || activeBook.chapters[0];
  const paragraphText = currentChapter.paragraphs[activeParagraphIndex] || '';

  // Filter available voices specifically for Brazilian Portuguese
  const ptVoices = availableVoices.filter(v => v.lang.toLowerCase().startsWith('pt'));

  return (
    <div id="tts-player-bar" className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 text-white p-4 md:px-8 z-40 shadow-2xl flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Active text snippet info */}
        <div className="flex items-center gap-3.5 w-full md:w-1/3 min-w-0">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-xl shadow-lg shadow-indigo-500/10 shrink-0">
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 px-1.5 py-0.5 rounded-sm">
                Leitura em Voz Alta
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Pág {activeParagraphIndex + 1} de {currentChapter.paragraphs.length}
              </span>
            </div>
            <h4 className="text-xs font-bold truncate text-slate-200">
              {currentChapter.title}
            </h4>
            <p className="text-[10px] text-slate-400 italic truncate max-w-[280px]">
              &quot;{paragraphText}&quot;
            </p>
          </div>
        </div>

        {/* Media Control Core Buttons */}
        <div className="flex items-center gap-3">
          {/* Skip Back */}
          <button
            id="tts-skip-back-btn"
            onClick={onPrevParagraph}
            disabled={activeParagraphIndex === 0}
            className={`p-2.5 rounded-xl border border-slate-800 transition-all ${
              activeParagraphIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105'
            }`}
            title="Parágrafo Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause Core */}
          <button
            id="tts-play-pause-btn"
            onClick={onPlayPause}
            className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pausar Leitura" : "Iniciar Leitura"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Stop / Exit */}
          <button
            id="tts-stop-btn"
            onClick={onStop}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all hover:scale-105"
            title="Parar Leitura"
          >
            <Square className="w-4 h-4 fill-rose-400/20" />
          </button>

          {/* Skip Forward */}
          <button
            id="tts-skip-forward-btn"
            onClick={onNextParagraph}
            disabled={activeParagraphIndex === currentChapter.paragraphs.length - 1}
            className={`p-2.5 rounded-xl border border-slate-800 transition-all ${
              activeParagraphIndex === currentChapter.paragraphs.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105'
            }`}
            title="Próximo Parágrafo"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Quality / Voice Selection Configuration */}
        <div className="flex items-center gap-3 w-full md:w-1/3 justify-end text-xs">
          {/* Rate Selector */}
          <div className="flex items-center gap-2 border border-slate-800 bg-slate-950/30 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Velocidade:</span>
            <select
              id="tts-rate-select"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="bg-transparent border-none text-xs font-bold text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="0.5" className="bg-slate-900">0.5x</option>
              <option value="0.75" className="bg-slate-900">0.75x</option>
              <option value="1" className="bg-slate-900">1.0x</option>
              <option value="1.25" className="bg-slate-900">1.25x</option>
              <option value="1.5" className="bg-slate-900">1.5x</option>
              <option value="2" className="bg-slate-900">2.0x</option>
            </select>
          </div>

          {/* Voice Dropdown Indicator */}
          <div className="relative">
            <button
              id="tts-voice-dropdown-btn"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-200 hover:text-white transition-all"
            >
              <Speech className="w-4 h-4 text-indigo-400" />
              <span className="max-w-[100px] truncate text-xs font-medium">
                {selectedVoice ? selectedVoice.name : 'Voz Padrão'}
              </span>
              {showVoiceSettings ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Voice Dropdown Panel */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  id="voice-dropdown-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-11 right-0 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-64 shadow-2xl z-50 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Escolher Voz (PT-BR)
                    </span>
                    <button onClick={() => setShowVoiceSettings(false)} className="text-[10px] text-slate-400 hover:text-white underline">
                      Ok
                    </button>
                  </div>

                  <div className="max-h-[160px] overflow-y-auto space-y-1 scrollbar-thin">
                    {ptVoices.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        <AlertCircle className="w-4 h-4 mx-auto mb-1 opacity-50" />
                        <p className="text-[10px]">Utilizando voz nativa do navegador.</p>
                      </div>
                    ) : (
                      ptVoices.map((voice) => {
                        const isSelected = selectedVoice?.voiceURI === voice.voiceURI;
                        return (
                          <button
                            key={voice.voiceURI}
                            id={`voice-option-btn-${voice.name}`}
                            onClick={() => {
                              onVoiceChange(voice);
                              setShowVoiceSettings(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-[10px] flex items-center justify-between gap-1.5 transition-colors ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{voice.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
