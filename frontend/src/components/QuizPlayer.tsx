import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Quiz } from '../types';
import { clsx } from 'clsx';

interface QuizPlayerProps {
  quiz: Quiz;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(quiz.questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const questions = quiz.questions?.map((q) => {
    let parsedOptions: string[] = [];
    try {
      parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      if (!Array.isArray(parsedOptions)) parsedOptions = [];
    } catch (e) {
      console.error("Failed to parse options for question", q.id, e);
      parsedOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']; // Fallback
    }
    return { ...q, options: parsedOptions };
  }) || [];

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(answers[current + 1]);
    } else {
      setFinished(true);
    }
  };

  const handleSelect = (optIdx: number) => {
    if (answers[current] !== null) return; // already answered
    const newAnswers = [...answers];
    newAnswers[current] = optIdx;
    setAnswers(newAnswers);
    setSelected(optIdx);
  };

  // Timer logic
  useEffect(() => {
    if (!expanded || finished) return;
    if (answers[current] !== null) return; // Stop timer if answered

    if (timeLeft === 0) {
      // Time up! Mark as wrong (-1 or just skip)
      const newAnswers = [...answers];
      newAnswers[current] = -1; // -1 means timed out/wrong
      setAnswers(newAnswers);
      setSelected(-1);
      
      // Auto advance after showing wrong briefly
      setTimeout(() => {
        handleNext();
      }, 1000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, expanded, finished, answers, current]);

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(10);
  }, [current]);

  const handleReset = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
    setTimeLeft(10);
  };

  // Calculate score excluding -1 (timeouts)
  const score = answers.filter((a, i) => questions[i] && a === questions[i].correctAnswer).length;
  const q = questions[current];

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center text-sm text-gray-500">
          This quiz has no questions available.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left"
      >
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{questions.length} questions</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              {finished ? (
                <div className="text-center py-4">
                  <div className={clsx(
                    'text-4xl font-bold mb-2',
                    score >= questions.length * 0.8 ? 'text-green-600' : score >= questions.length * 0.5 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {score}/{questions.length}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {score >= questions.length * 0.8 ? 'Excellent! 🎉' : score >= questions.length * 0.5 ? 'Good effort!' : 'Keep practicing!'}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">
                        Question {current + 1} of {questions.length}
                      </span>
                      {answers[current] === null && (
                        <span className={clsx(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          timeLeft <= 2 ? "bg-red-100 text-red-600 animate-pulse" : "bg-brand-100 text-brand-600"
                        )}>
                          {timeLeft}s
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {questions.map((_, i) => (
                        <div
                          key={i}
                          className={clsx(
                            'h-1.5 rounded-full transition-all',
                            i === current ? 'w-4 bg-brand-600' :
                            answers[i] !== null
                              ? answers[i] === questions[i].correctAnswer ? 'w-1.5 bg-green-500' : 'w-1.5 bg-red-400'
                              : 'w-1.5 bg-gray-200 dark:bg-gray-700'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="font-medium text-gray-900 dark:text-white mb-4">{q.questionText}</p>

                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, i) => {
                      const answered = answers[current] !== null;
                      const isCorrect = i === q.correctAnswer;
                      const isSelected = answers[current] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(i)}
                          disabled={answered}
                          className={clsx(
                            'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150',
                            !answered && 'hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20',
                            answered && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
                            answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
                            answered && !isSelected && !isCorrect && 'border-gray-100 dark:border-gray-800 text-gray-400',
                            !answered && 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 w-5 h-5 rounded-full border text-xs flex items-center justify-center font-medium">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                            {answered && isCorrect && <CheckCircle className="w-4 h-4 text-green-600 ml-auto shrink-0" />}
                            {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {answers[current] !== null && q.explanation && (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300 mb-4">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}

                  {answers[current] !== null && (
                    <Button onClick={handleNext} className="w-full">
                      {current < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
