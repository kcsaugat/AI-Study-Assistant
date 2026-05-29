import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Layers, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FlashcardsHubPage() {
  const navigate = useNavigate();
  const { data: decks, isLoading } = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: async () => {
      const res = await api.get('/ai/flashcards/all');
      return res.data.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          Study Decks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your flashcards using our smart spaced-repetition algorithm to maximize long-term retention.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : !decks?.length ? (
        <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Study Decks Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't generated any flashcards yet. Go to your notes and click "Generate Flashcards" to start building your collection.
          </p>
          <button
            onClick={() => navigate('/notes')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-500 transition-colors shadow-sm"
          >
            Go to My Notes <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck: any, index: number) => {
            const now = new Date();
            const dueCards = deck.flashcards?.filter((c: any) => !c.nextReview || new Date(c.nextReview) <= now).length || 0;
            const totalCards = deck.flashcards?.length || 0;
            const progress = totalCards > 0 ? Math.round(((totalCards - dueCards) / totalCards) * 100) : 0;
            
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50 group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative overflow-hidden">
                  {dueCards > 0 && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      {dueCards} Due Today
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col h-full mt-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
                      {deck.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {totalCards} Cards
                    </p>
                    
                    <div className="mt-auto">
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Mastery Progress</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <Link
                        to={`/notes/${deck.noteId}?flashcardDeck=${deck.id}`}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium transition-colors ${
                          dueCards > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {dueCards > 0 ? 'Review Now' : 'Study Ahead'}
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
