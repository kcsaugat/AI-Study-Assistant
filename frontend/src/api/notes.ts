import { api } from './client';
import { Note, DashboardStats } from '../types';

export const notesApi = {
  getAll: () => api.get<{ data: Note[] }>('/notes'),
  getOne: (id: string) => api.get<{ data: Note }>(`/notes/${id}`),
  create: (data: { title: string; content: string }) => api.post<{ data: Note }>('/notes', data),
  update: (id: string, data: { title: string; content: string }) =>
    api.put<{ data: Note }>(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  dashboard: () => api.get<{ data: DashboardStats }>('/notes/dashboard'),
};
