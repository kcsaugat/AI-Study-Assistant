import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Trash2, Clock, Brain, Layers } from 'lucide-react';
import { notesApi } from '../api/notes';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate, truncate } from '../utils/format';
import { Note } from '../types';
import toast from 'react-hot-toast';

export function NotesPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesApi.getAll().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const filtered = notes.filter((n: Note) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{notes.length} notes total</p>
        </div>
        <Link to="/notes/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm focus:shadow-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search ? 'No notes match your search' : 'No notes yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {search ? 'Try a different search term.' : 'Create your first note to get started.'}
          </p>
          {!search && (
            <Link to="/notes/new">
              <Button>
                <Plus className="w-4 h-4" />
                Create first note
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note: Note, i: number) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card hover className="group relative flex flex-col h-full bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-100/50 to-transparent dark:from-slate-800/50 dark:to-brand-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm">
                      <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Delete this note?')) deleteMutation.mutate(note.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/notes/${note.id}`} className="flex-1 block relative z-10">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors drop-shadow-sm">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                      {truncate(note.content, 120)}
                    </p>
                  </Link>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-white/10 relative z-10">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(note.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {note.summary && <Badge variant="success">Summary</Badge>}
                      {(note._count?.quizzes ?? 0) > 0 && (
                        <Badge variant="info">{note._count?.quizzes} quiz</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
