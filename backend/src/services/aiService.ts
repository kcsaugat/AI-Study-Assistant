import { genAI } from '../config/gemini';
import { prisma } from '../config/database';

// Helper to check if we should mock
function shouldMock() {
  return !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('missing');
}

// ── Summarize ──────────────────────────────────────────────────────────────

export async function summarizeNote(noteId: string, userId: string): Promise<string> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let summary = '';
  
  if (shouldMock()) {
    summary = `- Key concept: Understanding the core principles of this topic.\n- Main idea: ${note.title} is an essential study material.\n- Details: The notes cover various fundamental aspects that are critical for mastery.\n- Conclusion: Review this material frequently to retain knowledge.`;
  } else {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert study assistant. Summarize the following study notes concisely and clearly. Use bullet points for key concepts. Keep it focused and educational.\n\nNotes:\n${note.content}`;
      const result = await model.generateContent(prompt);
      summary = result.response.text();
    } catch (error) {
      console.warn("Gemini summarize error, using fallback mock:", error);
      summary = `- Key concept: Understanding the core principles of this topic.\n- Main idea: ${note.title} is an essential study material.\n- Details: The notes cover various fundamental aspects that are critical for mastery.\n- Conclusion: Review this material frequently to retain knowledge.`;
    }
  }

  // Upsert so re-summarizing replaces the old one
  await prisma.summary.upsert({
    where: { noteId },
    create: { noteId, content: summary },
    update: { content: summary },
  });

  return summary;
}

export async function getSummary(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  return prisma.summary.findUnique({ where: { noteId } });
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuiz(
  noteId: string,
  userId: string,
  questionCount = 5
): Promise<{ quizId: string; questions: QuizQuestion[] }> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let questions: QuizQuestion[] = [];

  if (shouldMock()) {
    // Mock Response
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        question: `What is a key takeaway from "${note.title}" (Mock Question ${i + 1})?`,
        options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
        correctAnswer: 2,
        explanation: "This is a mock explanation since no API key was provided."
      });
    }
  } else {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `You are a quiz generator. Generate exactly ${questionCount} multiple-choice questions from the provided study notes. 
Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "explanation": "brief explanation"
  }
]
correctAnswer is the zero-based index of the correct option.
Notes:
${note.content}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      questions = parsed.questions ?? parsed;
      if (!Array.isArray(questions)) throw new Error('Not an array');
    } catch (error) {
      console.warn("Gemini quiz error, using fallback mock:", error);
      for (let i = 0; i < questionCount; i++) {
        questions.push({
          question: `What is a key takeaway from "${note.title}" (Mock Question ${i + 1})?`,
          options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
          correctAnswer: 2,
          explanation: "This is a fallback mock explanation used because the AI service is currently unavailable or the API key is invalid."
        });
      }
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: `Quiz: ${note.title}`,
      noteId,
      questions: {
        create: questions.map((q) => ({
          questionText: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    },
    include: { questions: true },
  });

  return {
    quizId: quiz.id,
    questions: quiz.questions.map((q) => ({
      question: q.questionText,
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
    })),
  };
}

export async function getQuizzesForNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  return prisma.quiz.findMany({
    where: { noteId },
    orderBy: { createdAt: 'desc' },
    include: { questions: true },
  });
}

// ── Flashcards ─────────────────────────────────────────────────────────────

export interface FlashcardItem {
  front: string;
  back: string;
}

export async function generateFlashcards(
  noteId: string,
  userId: string,
  cardCount = 10
): Promise<{ deckId: string; cards: FlashcardItem[] }> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let cards: FlashcardItem[] = [];

  if (shouldMock()) {
    // Mock response
    for (let i = 0; i < cardCount; i++) {
      cards.push({
        front: `Mock Term ${i + 1} from ${note.title}`,
        back: `This is a mock definition for Term ${i + 1}. Please add a real API key for real flashcards.`
      });
    }
  } else {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `You are a flashcard generator. Create exactly ${cardCount} study flashcards from the provided notes.
Return ONLY valid JSON in this format:
[
  { "front": "term or question", "back": "definition or answer" }
]
Notes:
${note.content}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      cards = parsed.flashcards ?? parsed;
      if (!Array.isArray(cards)) throw new Error('Not an array');
    } catch (error) {
      console.warn("Gemini flashcard error, using fallback mock:", error);
      for (let i = 0; i < cardCount; i++) {
        cards.push({
          front: `Mock Term ${i + 1} from ${note.title}`,
          back: `This is a fallback definition for Term ${i + 1}. The AI service is currently unavailable.`
        });
      }
    }
  }

  const deck = await prisma.flashcardDeck.create({
    data: {
      title: `Flashcards: ${note.title}`,
      noteId,
      flashcards: {
        create: cards.map((c) => ({ front: c.front, back: c.back })),
      },
    },
    include: { flashcards: true },
  });

  return {
    deckId: deck.id,
    cards: deck.flashcards.map((c) => ({ front: c.front, back: c.back })),
  };
}

export async function getFlashcardsForNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  return prisma.flashcardDeck.findMany({
    where: { noteId },
    orderBy: { createdAt: 'desc' },
    include: { flashcards: true },
  });
}

// ── Chat Tutor ─────────────────────────────────────────────────────────────

export async function createChatSession(userId: string, noteId?: string) {
  let title = 'Study Chat';
  let noteContent = '';
  if (noteId) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (note) {
      title = `Chat: ${note.title}`;
      noteContent = note.content;
    }
  }
  const session = await prisma.chatSession.create({
    data: { title, userId, noteId: noteId ?? null },
  });
  return { session, noteContent };
}

export async function sendChatMessage(
  sessionId: string,
  userId: string,
  userMessage: string
): Promise<string> {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 20 },
      note: true,
    },
  });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });

  // Save user message first
  await prisma.chatMessage.create({
    data: { sessionId, role: 'user', content: userMessage },
  });

  let assistantMessage = '';

  if (shouldMock()) {
    // Mock response
    assistantMessage = `(Mock AI Response) You said: "${userMessage}". Since there is no valid API key configured, I am replying with this placeholder text. Please add a valid API key to enable real AI responses.`;
  } else {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const systemPrompt = session.note
        ? `You are a helpful AI study tutor. The student is studying the following material:\n\n${session.note.content}\n\nAnswer questions based on this material. Be clear, encouraging, and educational.`
        : 'You are a helpful AI study tutor. Help students understand their study material. Be clear, encouraging, and educational.';

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood! I will act as a helpful AI study tutor." }] },
          ...session.messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        ]
      });

      const result = await chat.sendMessage(userMessage);
      assistantMessage = result.response.text();
    } catch (error) {
      console.warn("Gemini chat error, using fallback mock:", error);
      assistantMessage = `(Mock AI Response) You said: "${userMessage}". The AI service is currently unavailable or your API key is invalid, so I am replying with this placeholder text.`;
    }
  }

  await prisma.chatMessage.create({
    data: { sessionId, role: 'assistant', content: assistantMessage },
  });

  return assistantMessage;
}

export async function getChatSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      note: { select: { title: true } },
      _count: { select: { messages: true } },
    },
  });
}

export async function getChatMessages(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}
