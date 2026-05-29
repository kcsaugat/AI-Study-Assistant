import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, BookOpen, Brain, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AddEventModal } from '../components/AddEventModal';

export function PlannerPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['planner', 'events'],
    queryFn: async () => {
      const res = await api.get('/ai/planner/events');
      return res.data.data;
    },
  });

  const createEvent = useMutation({
    mutationFn: async (newEvent: any) => {
      const res = await api.post('/ai/planner/events', newEvent);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'events'] });
      toast.success('Event added to planner');
      setIsAddModalOpen(false);
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.delete(`/ai/planner/events/${eventId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'events'] });
      toast.success('Event deleted');
    }
  });

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const todayEvents = events?.filter((e: any) => {
    const eDate = new Date(e.date);
    const now = new Date();
    return eDate.getDate() === now.getDate() && eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
  }) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            Study Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule your exams, review sessions, and keep track of your daily study goals.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-sky-600 hover:bg-sky-500 gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 dark:bg-gray-950 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white dark:bg-gray-900 p-4 min-h-[100px]" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                
                // Find events for this day
                const dayEvents = events?.filter((e: any) => {
                  const eDate = new Date(e.date);
                  return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
                }) || [];

                return (
                  <div key={day} className={`bg-white dark:bg-gray-900 p-2 min-h-[100px] border-t border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${isToday ? 'ring-2 ring-inset ring-sky-500' : ''}`}>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-sky-600 dark:text-sky-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((e: any) => (
                        <div key={e.id} className="text-[10px] px-1.5 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 rounded truncate font-medium">
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/10 dark:to-indigo-900/10 border-sky-100 dark:border-sky-900/30">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" /> Today's Agenda
            </h3>
            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                 <p className="text-sm text-gray-500 italic">No events scheduled for today.</p>
              ) : (
                todayEvents.map((e: any) => (
                  <div key={e.id} className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 group relative">
                    <div className="flex gap-3 pr-8">
                      <div className="w-1.5 rounded-full" style={{ backgroundColor: e.color || '#3b82f6' }}></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{e.title}</h4>
                        <p className="text-xs text-gray-500">{e.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteEvent.mutate(e.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white/40 dark:bg-gray-900/40">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-purple-500" /> Smart Suggestions
            </h3>
            <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2">
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs">
                  <div className="mt-0.5"><BookOpen className="w-3 h-3 text-gray-400 shrink-0" /></div>
                  <span className="text-gray-600 dark:text-gray-400 leading-snug">You haven't studied <b>Physics</b> in 5 days. Consider scheduling a review session soon to prevent forgetting.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(event) => createEvent.mutate(event)}
        isPending={createEvent.isPending}
      />
    </div>
  );
}

