import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: { title: string; date: string; type: string; color: string }) => void;
  isPending: boolean;
}

export function AddEventModal({ isOpen, onClose, onAdd, isPending }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Study Session');
  const [color, setColor] = useState('#3b82f6'); // default blue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    
    onAdd({
      title,
      date: new Date(date).toISOString(),
      type,
      color
    });
    
    // Reset form after successful submission (or optimistically)
    setTitle('');
    setDate('');
    setType('Study Session');
    setColor('#3b82f6');
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Add Planner Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology Midterm"
          required
        />
        
        <Input
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Type
          </label>
          <select 
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Study Session">Study Session</option>
            <option value="Exam">Exam / Midterm</option>
            <option value="Assignment">Assignment Due</option>
            <option value="Review">Flashcard Review</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color Indicator
          </label>
          <div className="flex gap-2">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-brand-500' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Save Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
