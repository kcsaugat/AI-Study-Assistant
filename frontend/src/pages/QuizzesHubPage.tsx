import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Brain, HelpCircle, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function QuizzesHubPage() {
  const navigate = useNavigate();
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes', 'all'],
    queryFn: async () => {
      const res = await api.get('/ai/quizzes/all');
      return res.data.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
            <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          Quizzes & Assessments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your past quizzes, re-take them to improve your scores, and track your learning progress.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : !quizzes?.length ? (
        <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Quizzes Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't generated any quizzes yet. Go to your notes and click "Generate Quiz" or use the Magic Generator on the Dashboard.
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
          {quizzes.map((quiz: any, index: number) => {
            const bestAttempt = quiz.attempts?.reduce((max: number, a: any) => Math.max(max, a.score), 0) || 0;
            const scorePercent = quiz.attempts?.length > 0 ? Math.round((bestAttempt / quiz.questions.length) * 100) : 0;
            
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all hover:border-purple-200 dark:hover:border-purple-800/50 group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
                        {quiz.questions.length} Questions
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                      From note: {quiz.note?.title || 'Unknown Note'}
                    </p>
                    
                    <div className="mt-auto">
                      {quiz.attempts?.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Best Score</span>
                            <span className={`font-bold ${scorePercent >= 80 ? 'text-green-500' : scorePercent >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                              {scorePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div 
                              className={`h-full rounded-full ${scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{quiz.attempts.length} previous attempts</p>
                        </div>
                      ) : (
                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 italic">
                          Not attempted yet
                        </div>
                      )}
                      
                      <Link
                        to={`/notes/${quiz.noteId}?quiz=${quiz.id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-300 rounded-xl font-medium transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        {quiz.attempts?.length > 0 ? 'Re-take Quiz' : 'Start Quiz'}
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
