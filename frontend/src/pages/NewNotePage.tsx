import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { notesApi } from '../api/notes';
import { uploadApi } from '../api/upload';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';

export function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (!content.trim()) { toast.error('Please add some content'); return; }
    setSaving(true);
    try {
      const res = await notesApi.create({ title: title.trim(), content: content.trim() });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Note saved!');
      navigate(`/notes/${res.data.data.id}`);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // OCR for Images
    if (file.type.startsWith('image/')) {
      try {
        toast('Processing image text (OCR)...', { icon: '🔍' });
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        
        if (text.trim()) {
          setContent(prev => (prev ? `${prev}\n\n${text.trim()}` : text.trim()));
          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
          toast.success('Text extracted from image!');
        } else {
          toast.error('No text found in image.');
        }
      } catch (err) {
        toast.error('Failed to process image');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    // Backend parse for PDFs/TXT
    try {
      const res = await uploadApi.uploadFile(file);
      setContent(prev => (prev ? `${prev}\n\n${res.data.data.text}` : res.data.data.text));
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      toast.success('File text extracted successfully!');
    } catch {
      toast.error('Failed to parse file. Ensure it is a text-based file, PDF, or DOCX.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="*"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              <Upload className="w-4 h-4" />
              Upload Document/Image
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" />
              Save Note
            </Button>
          </div>
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
            placeholder="Paste, type your study material, or upload a PDF to extract text..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="font-mono text-sm"
          />
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Tip: You can now upload ANY file (PDF, DOCX, TXT, CSV, etc.) to instantly extract and inject its text into the editor!
        </p>
      </motion.div>
    </div>
  );
}
