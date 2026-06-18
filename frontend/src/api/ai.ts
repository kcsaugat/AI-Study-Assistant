import { api } from './client';
import { Summary, Quiz, FlashcardDeck, ChatSession, ChatMessage } from '../types';

export const aiApi = {
  summarize: (noteId: string) =>
    api.post<{ data: { summary: string } }>(`/ai/notes/${noteId}/summarize`),

  getSummary: (noteId: string) =>
    api.get<{ data: { summary: Summary | null } }>(`/ai/notes/${noteId}/summary`),

  deleteSummary: (noteId: string) =>
    api.delete(`/ai/notes/${noteId}/summary`),

  generateQuiz: (noteId: string, questionCount = 5) =>
    api.post<{ data: { quizId: string; questions: Quiz['questions'] } }>(
      `/ai/notes/${noteId}/quiz`,
      { questionCount }
    ),

  getQuizzes: (noteId: string) =>
    api.get<{ data: Quiz[] }>(`/ai/notes/${noteId}/quizzes`),

  deleteQuiz: (noteId: string, quizId: string) =>
    api.delete(`/ai/notes/${noteId}/quiz/${quizId}`),

  generateFlashcards: (noteId: string, cardCount = 10) =>
    api.post<{ data: { deckId: string; cards: Array<{ front: string; back: string }> } }>(
      `/ai/notes/${noteId}/flashcards`,
      { cardCount }
    ),

  getFlashcardDecks: (noteId: string) =>
    api.get<{ data: FlashcardDeck[] }>(`/ai/notes/${noteId}/flashcard-decks`),

  deleteFlashcardDeck: (noteId: string, deckId: string) =>
    api.delete(`/ai/notes/${noteId}/flashcard-decks/${deckId}`),

  reviewFlashcard: (flashcardId: string, quality: number) =>
    api.post(`/ai/flashcards/${flashcardId}/review`, { quality }),

  createChatSession: (noteId?: string) =>
    api.post<{ data: ChatSession }>('/ai/chat/sessions', { noteId }),

  getSessions: () =>
    api.get<{ data: ChatSession[] }>('/ai/chat/sessions'),

  getMessages: (sessionId: string) =>
    api.get<{ data: ChatMessage[] }>(`/ai/chat/sessions/${sessionId}/messages`),

  sendMessage: (sessionId: string, message: string) =>
    api.post<{ data: { reply: string } }>(`/ai/chat/sessions/${sessionId}/messages`, { message }),

  deleteSession: (sessionId: string) => api.delete(`/ai/chat/sessions/${sessionId}`),
  
  getAiStatus: () =>
    api.get<{ data: { geminiConfigured: boolean; groqConfigured: boolean; openaiConfigured: boolean } }>('/ai/status'),
};
