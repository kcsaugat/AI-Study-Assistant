import { api } from './client';
import { Summary, Quiz, FlashcardDeck, ChatSession, ChatMessage } from '../types';

export const aiApi = {
  summarize: (noteId: string) =>
    api.post<{ data: { summary: string } }>(`/ai/notes/${noteId}/summarize`),

  getSummary: (noteId: string) =>
    api.get<{ data: { summary: Summary | null } }>(`/ai/notes/${noteId}/summary`),

  generateQuiz: (noteId: string, questionCount = 5) =>
    api.post<{ data: { quizId: string; questions: Quiz['questions'] } }>(
      `/ai/notes/${noteId}/quiz`,
      { questionCount }
    ),

  getQuizzes: (noteId: string) =>
    api.get<{ data: Quiz[] }>(`/ai/notes/${noteId}/quizzes`),

  generateFlashcards: (noteId: string, cardCount = 10) =>
    api.post<{ data: { deckId: string; cards: Array<{ front: string; back: string }> } }>(
      `/ai/notes/${noteId}/flashcards`,
      { cardCount }
    ),

  getFlashcardDecks: (noteId: string) =>
    api.get<{ data: FlashcardDeck[] }>(`/ai/notes/${noteId}/flashcard-decks`),

  createChatSession: (noteId?: string) =>
    api.post<{ data: ChatSession }>('/ai/chat/sessions', { noteId }),

  getSessions: () =>
    api.get<{ data: ChatSession[] }>('/ai/chat/sessions'),

  getMessages: (sessionId: string) =>
    api.get<{ data: ChatMessage[] }>(`/ai/chat/sessions/${sessionId}/messages`),

  sendMessage: (sessionId: string, message: string) =>
    api.post<{ data: { reply: string } }>(`/ai/chat/sessions/${sessionId}/messages`, { message }),
};
