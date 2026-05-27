import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FlashcardDeck } from '../types';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
}

export function FlashcardViewer({ deck }: FlashcardViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const cards = deck.flashcards;

  const goNext = () => {
    setDirection(1);
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + 1) % cards.length), 150);
  };

  const goPrev = () => {
    setDirection(-1);
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c - 1 + cards.length) % cards.length), 150);
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
                    transition={{ duration: 0.4 }}
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
