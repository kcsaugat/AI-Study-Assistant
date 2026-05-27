import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Brain, HelpCircle, Layers, MessageCircle,
  Edit2, Save, X, Loader2, ChevronDown, ChevronUp, Trash2, Download
} from 'lucide-react';
import { notesApi } from '../api/notes';
import { aiApi } from '../api/ai';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { QuizPlayer } from '../components/QuizPlayer';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { formatDate } from '../utils/format';
import toast from 'react-hot-toast';
import { Quiz, FlashcardDeck } from '../types';

type Tab = 'note' | 'summary' | 'quiz' | 'flashcards';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('note');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.getOne(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => aiApi.getSummary(id!).then((r) => r.data.data.summary),
    enabled: !!id && tab === 'summary',
  });

  const { data: quizzes = [], refetch: refetchQuizzes } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => aiApi.getQuizzes(id!).then((r) => r.data.data),
    enabled: !!id && tab === 'quiz',
  });

  const { data: decks = [], refetch: refetchDecks } = useQuery({
    queryKey: ['flashcards', id],
    queryFn: () => aiApi.getFlashcardDecks(id!).then((r) => r.data.data),
    enabled: !!id && tab === 'flashcards',
  });

  const summarizeMutation = useMutation({
    mutationFn: () => aiApi.summarize(id!),
    onSuccess: () => {
      refetchSummary();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Summary generated!');
    },
    onError: () => toast.error('Failed to generate summary'),
  });

  const quizMutation = useMutation({
    mutationFn: () => aiApi.generateQuiz(id!, 5),
    onSuccess: () => {
      refetchQuizzes();
      toast.success('Quiz generated!');
    },
    onError: () => toast.error('Failed to generate quiz'),
  });

  const flashcardMutation = useMutation({
    mutationFn: () => aiApi.generateFlashcards(id!, 10),
    onSuccess: () => {
      refetchDecks();
      toast.success('Flashcards generated!');
    },
    onError: () => toast.error('Failed to generate flashcards'),
  });

  const updateMutation = useMutation({
    mutationFn: () => notesApi.update(id!, { title: editTitle, content: editContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditing(false);
      toast.success('Note updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/notes');
      toast.success('Note deleted');
    },
  });

  if (isLoading || !note) return <PageSpinner />;

  const startEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditing(true);
  };

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: 'note', label: 'Note', icon: Edit2 },
    { key: 'summary', label: 'Summary', icon: Brain },
    { key: 'quiz', label: 'Quiz', icon: HelpCircle },
    { key: 'flashcards', label: 'Flashcards', icon: Layers },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notes')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(note.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (confirm('Delete this note?')) deleteMutation.mutate(); }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* NOTE TAB */}
          {tab === 'note' && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setTab('summary'); if (!summary) summarizeMutation.mutate(); }}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Summarize
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setTab('quiz'); quizMutation.mutate(); }}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Generate Quiz
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setTab('flashcards'); flashcardMutation.mutate(); }}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Flashcards
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/chat', { state: { noteId: id } })}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat Tutor
                </Button>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                  {note.content}
                </pre>
              </div>
            </Card>
          )}

          {/* SUMMARY TAB */}
          {tab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h2>
                <Button
                  size="sm"
                  onClick={() => summarizeMutation.mutate()}
                  loading={summarizeMutation.isPending}
                >
                  <Brain className="w-3.5 h-3.5" />
                  {summary ? 'Regenerate' : 'Generate'}
                </Button>
              </div>
              {summarizeMutation.isPending ? (
                <Card>
                  <div className="flex items-center gap-3 text-gray-500 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                    <span>Generating summary with AI...</span>
                  </div>
                </Card>
              ) : summary ? (
                <Card>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {(summary as { content?: string; id?: string })?.content ?? (typeof summary === 'string' ? summary : '')}
                    </p>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-8">
                    <Brain className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No summary yet. Click "Generate" to create one.</p>
                    <Button onClick={() => summarizeMutation.mutate()} loading={summarizeMutation.isPending}>
                      <Brain className="w-4 h-4" />
                      Generate Summary
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* QUIZ TAB */}
          {tab === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quizzes</h2>
                <Button size="sm" onClick={() => quizMutation.mutate()} loading={quizMutation.isPending}>
                  <HelpCircle className="w-3.5 h-3.5" />
                  New Quiz
                </Button>
              </div>
              {quizMutation.isPending && (
                <Card>
                  <div className="flex items-center gap-3 text-gray-500 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                    <span>Generating quiz questions...</span>
                  </div>
                </Card>
              )}
              {quizzes.length === 0 && !quizMutation.isPending ? (
                <Card>
                  <div className="text-center py-8">
                    <HelpCircle className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No quizzes yet.</p>
                    <Button onClick={() => quizMutation.mutate()}>Generate Quiz</Button>
                  </div>
                </Card>
              ) : (
                quizzes.map((quiz: Quiz) => (
                  <QuizPlayer key={quiz.id} quiz={quiz} />
                ))
              )}
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {tab === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Flashcard Decks</h2>
                <Button size="sm" onClick={() => flashcardMutation.mutate()} loading={flashcardMutation.isPending}>
                  <Layers className="w-3.5 h-3.5" />
                  New Deck
                </Button>
              </div>
              {flashcardMutation.isPending && (
                <Card>
                  <div className="flex items-center gap-3 text-gray-500 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                    <span>Generating flashcards...</span>
                  </div>
                </Card>
              )}
              {decks.length === 0 && !flashcardMutation.isPending ? (
                <Card>
                  <div className="text-center py-8">
                    <Layers className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No flashcard decks yet.</p>
                    <Button onClick={() => flashcardMutation.mutate()}>Generate Flashcards</Button>
                  </div>
                </Card>
              ) : (
                decks.map((deck: FlashcardDeck) => (
                  <FlashcardViewer key={deck.id} deck={deck} />
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Note" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Textarea
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={12}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
