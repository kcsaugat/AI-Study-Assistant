import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FlashcardDeck } from '../types';
import { aiApi } from '../api/ai';
import toast from 'react-hot-toast';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
}

export function FlashcardViewer({ deck }: FlashcardViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: number }) => aiApi.reviewFlashcard(id, quality),
    onMutate: () => {
      // Optimistic instant feedback
      goNext();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onError: () => toast.error('Failed to submit review'),
  });

  const cards = deck.flashcards;

  const goNext = () => {
    setDirection(1);
    setFlipped(false);
    setCurrent((c) => (c + 1) % cards.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setFlipped(false);
    setCurrent((c) => (c - 1 + cards.length) % cards.length);
  };

  const reset = () => {
    setCurrent(0);
    setFlipped(false);
  };

  const card = cards[current];

  return (
    <Card>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left"
      >
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{deck.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{cards.length} cards</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && cards.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center text-xs text-gray-500 mb-3">
                {current + 1} / {cards.length} — click card to flip
              </div>

              {/* Flashcard */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${current}-${direction}`}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setFlipped((f) => !f)}
                  className="cursor-pointer select-none"
                >
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
                    className="relative h-40"
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#d946ef]/20 to-[#00f0ff]/20 border border-white/20 backdrop-blur-xl text-center shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="text-gray-900 dark:text-white font-medium text-lg drop-shadow-md">{card.front}</p>
                    </div>
                    {/* Back */}
                    <div
                      className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-gradient-to-bl from-[#00f0ff]/20 to-[#d946ef]/20 border border-white/20 backdrop-blur-xl text-center shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="text-gray-900 dark:text-white text-base drop-shadow-md">{card.back}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {flipped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mt-4"
                >
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => reviewMutation.mutate({ id: card.id, quality: 1 })}>Again</Button>
                  <Button size="sm" variant="outline" className="text-orange-500 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => reviewMutation.mutate({ id: card.id, quality: 2 })}>Hard</Button>
                  <Button size="sm" variant="outline" className="text-green-500 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => reviewMutation.mutate({ id: card.id, quality: 3 })}>Good</Button>
                  <Button size="sm" variant="outline" className="text-blue-500 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => reviewMutation.mutate({ id: card.id, quality: 4 })}>Easy</Button>
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={goPrev}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
                <button
                  onClick={goNext}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
