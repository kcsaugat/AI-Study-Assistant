import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { notesApi } from '../api/notes';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (!content.trim()) { toast.error('Please add some content'); return; }
    setSaving(true);
    try {
      const res = await notesApi.create({ title: title.trim(), content: content.trim() });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Note saved!');
      navigate(`/notes/${res.data.data.id}`);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notes')}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Note</h1>
          </div>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Save Note
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Chapter 3 — Photosynthesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Notes"
            placeholder="Paste or type your study material here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="font-mono text-sm"
          />
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Tip: The more detailed your notes, the better the AI-generated summaries, quizzes, and flashcards.
        </p>
      </motion.div>
    </div>
  );
}
