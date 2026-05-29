import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface MagicGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MagicGeneratorModal({ isOpen, onClose }: MagicGeneratorModalProps) {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'quiz' | 'flashcards'>('quiz');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post<{ data: { noteId: string } }>('/ai/magic-generate', { topic, type });
      onClose();
      navigate(`/notes/${response.data.data.noteId}`);
    } catch (error) {
      console.error("Magic generate error", error);
      alert("Failed to generate magic note. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: -100, rotateY: 30 }}
          animate={{ scale: 1, y: 0, rotateY: 0 }}
          exit={{ scale: 0.8, y: -100, rotateY: -30 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative w-full max-w-2xl bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-[40px] border border-white/40 dark:border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                Magic Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">Instantly synthesize study materials.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          <div className="relative z-10 p-8 flex flex-col gap-6">
            
            {/* Interactive Form Section */}
            <div className="flex-1 flex flex-col gap-6 w-full">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Topic or Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Photosynthesis, World War 2..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setType('quiz')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      type === 'quiz' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span className="font-bold">Quiz</span>
                  </button>
                  <button
                    onClick={() => setType('flashcards')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      type === 'flashcards' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Layers className="w-6 h-6 mb-2" />
                    <span className="font-bold">Flashcards</span>
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Synthesizing Data...</span>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Magic</>
                )}
              </Button>
            </div>

            {/* Explanation Section */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 w-full">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-600 border border-purple-500/30">i</span> 
                How it works
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                <span className="block"><strong>Zero Notes Required:</strong> You don't need to write or upload a note first.</span>
                <span className="block"><strong>LLM Pipeline:</strong> The system sends your topic directly to the AI, which synthesizes a comprehensive knowledge base in the background.</span>
                <span className="block"><strong>Instant Material:</strong> It then instantly parses that hidden knowledge base into the format you requested, saving you hours of manual compiling!</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
