import { groq } from '../config/groq';
import { prisma } from '../config/database';

declare const fetch: any;

function getAiProvider(): 'gemini' | 'groq' | 'openai' | 'mock' {
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('key-here') && !process.env.GEMINI_API_KEY.includes('your_gemini')) {
    return 'gemini';
  }
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('key-here') && !process.env.GROQ_API_KEY.includes('your_groq')) {
    return 'groq';
  }
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('key-here') && !process.env.OPENAI_API_KEY.includes('your_openai') && !process.env.OPENAI_API_KEY.includes('sk-...')) {
    return 'openai';
  }
  return 'mock';
}

function shouldMock() {
  return getAiProvider() === 'mock';
}

interface CallAiOptions {
  systemPrompt?: string;
  jsonMode?: boolean;
}

interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callAi(prompt: string, options?: CallAiOptions): Promise<string> {
  const provider = getAiProvider();

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          parts: [
            { text: (options?.systemPrompt ? `${options.systemPrompt}\n\n` : '') + prompt }
          ]
        }
      ]
    };

    if (options?.jsonMode) {
      requestBody.generationConfig = {
        responseMimeType: "application/json"
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const messages: any[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const requestBody: any = {
      model: 'gpt-4o-mini',
      messages,
    };

    if (options?.jsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as any;
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");
    return text;
  }

  if (provider === 'groq') {
    const messages: any[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const params: any = {
      messages,
      model: 'llama-3.3-70b-versatile',
    };

    if (options?.jsonMode) {
      params.response_format = { type: 'json_object' };
    }

    const completion = await groq.chat.completions.create(params);
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
  }

  throw new Error("No AI provider available");
}

async function callAiChat(messages: ChatMessageInput[]): Promise<string> {
  const provider = getAiProvider();

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents: any[] = [];
    let systemInstruction: any = undefined;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = {
          parts: [{ text: msg.content }]
        };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const requestBody: any = { contents };
    if (systemInstruction) {
      requestBody.systemInstruction = systemInstruction;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  }

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as any;
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");
    return text;
  }

  if (provider === 'groq') {
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
    });
    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
  }

  throw new Error("No AI provider available");
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
      const prompt = `You are an expert study assistant. Summarize the following study notes concisely and clearly. Use bullet points for key concepts. Keep it focused and educational.\n\nNotes:\n${note.content}`;
      summary = await callAi(prompt);
    } catch (error) {
      console.warn("AI summarize error, using fallback mock:", error);
      summary = `- Key concept: Understanding the core principles of this topic.\n- Main idea: ${note.title} is an essential study material.\n- Details: The notes cover various fundamental aspects that are critical for mastery.\n- Conclusion: Review this material frequently to retain knowledge.`;
    }
  }

  // Upsert so re-summarizing replaces the old one
  await prisma.summary.upsert({
    where: { noteId },
    create: { noteId, content: summary },
    update: { content: summary },
  });

  await prisma.activityLog.create({
    data: { userId, action: 'SUMMARY_GENERATED' }
  });

  return summary;
}

export async function getSummary(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  return prisma.summary.findUnique({ where: { noteId } });
}

export async function deleteSummary(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  
  await prisma.summary.delete({ where: { noteId } });
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
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        question: `What is a key takeaway from "${note.title}" (Practice Question ${i + 1})?`,
        options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
        correctAnswer: 2,
        explanation: "This is a practice explanation."
      });
    }
  } else {
    try {
      const prompt = `You are a quiz generator. Generate exactly ${questionCount} multiple-choice questions from the provided study notes. 
Return ONLY a valid JSON object with a single key "questions" containing an array in this exact format:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "brief explanation"
    }
  ]
}
correctAnswer is the zero-based index of the correct option.
Notes:
${note.content}`;

      const text = await callAi(prompt, { jsonMode: true });
      const parsed = JSON.parse(text);
      questions = parsed.questions || [];
    } catch (error) {
      console.warn("AI quiz error, using fallback mock:", error);
      for (let i = 0; i < questionCount; i++) {
        questions.push({
          question: `What is a key takeaway from "${note.title}" (Practice Question ${i + 1})?`,
          options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
          correctAnswer: 2,
          explanation: "This is a fallback practice explanation generated while offline."
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

  await prisma.activityLog.create({
    data: { userId, action: 'QUIZ_TAKEN' }
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

export async function deleteQuiz(quizId: string, userId: string) {
  const quiz = await prisma.quiz.findFirst({ 
    where: { id: quizId, note: { userId } } 
  });
  if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 });

  await prisma.quiz.delete({ where: { id: quizId } });
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
    for (let i = 0; i < cardCount; i++) {
      cards.push({
        front: `Key Term ${i + 1} from ${note.title}`,
        back: `This is a practice definition for Term ${i + 1}.`
      });
    }
  } else {
    try {
      const prompt = `You are a flashcard generator. Create exactly ${cardCount} study flashcards from the provided notes.
Return ONLY valid JSON in this format:
{
  "flashcards": [
    { "front": "term or question", "back": "definition or answer" }
  ]
}
Notes:
${note.content}`;

      const text = await callAi(prompt, { jsonMode: true });
      const parsed = JSON.parse(text);
      cards = parsed.flashcards || [];
    } catch (error) {
      console.warn("AI flashcard error, using fallback mock:", error);
      for (let i = 0; i < cardCount; i++) {
        cards.push({
          front: `Key Term ${i + 1} from ${note.title}`,
          back: `This is a fallback definition for Term ${i + 1} generated while offline.`
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

  await prisma.activityLog.create({
    data: { userId, action: 'FLASHCARD_GENERATED' }
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

export async function deleteFlashcardDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({ 
    where: { id: deckId, note: { userId } } 
  });
  if (!deck) throw Object.assign(new Error('Flashcard deck not found'), { statusCode: 404 });

  await prisma.flashcardDeck.delete({ where: { id: deckId } });
}

export async function reviewFlashcard(flashcardId: string, userId: string, quality: number) {
  // quality: 0 (blackout), 1 (wrong), 2 (hard), 3 (good), 4 (easy)
  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!card) throw Object.assign(new Error('Flashcard not found'), { statusCode: 404 });

  let { interval, easeFactor, repetitions } = card;

  if (quality < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      interval,
      easeFactor,
      repetitions,
      nextReview,
    }
  });
}

// ── Magic Generate ───────────────────────────────────────────────────────────

export async function magicGenerate(
  userId: string,
  topic: string,
  type: 'quiz' | 'flashcards'
): Promise<{ noteId: string }> {
  let noteContent = '';

  if (shouldMock()) {
    noteContent = `This is a magically generated study note for the topic: ${topic}. It covers all the essential concepts of ${topic} to help you study effectively while in offline mode.`;
  } else {
    try {
      const prompt = `You are an expert study assistant. Generate a comprehensive and educational study note about the following topic: "${topic}". The note should be well-structured with headings and bullet points.`;
      noteContent = await callAi(prompt);
    } catch (error) {
      console.warn("AI magic generate error, using fallback mock:", error);
      noteContent = `This is a magically generated offline note for the topic: ${topic}. The AI service is currently in offline mode.`;
    }
  }

  const note = await prisma.note.create({
    data: { userId, title: topic, content: noteContent },
  });

  if (type === 'quiz') {
    await generateQuiz(note.id, userId, 5);
  } else if (type === 'flashcards') {
    await generateFlashcards(note.id, userId, 10);
  }

  return { noteId: note.id };
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

async function getRealtimeContext(query: string): Promise<string> {
  let context = "";

  // 1. Wikipedia search
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as any;
    
    if (searchData.query?.search?.length > 0) {
      const topHit = searchData.query.search[0];
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${topHit.pageid}&format=json`;
      const extractRes = await fetch(extractUrl);
      const extractData = (await extractRes.json()) as any;
      const extract = extractData.query?.pages[topHit.pageid]?.extract || topHit.snippet.replace(/<[^>]+>/g, '');
      context += `Wikipedia: ${topHit.title} - ${extract}\n\n`;
    }
  } catch (err) {
    console.warn("Wikipedia search failed:", err);
  }

  // 2. DuckDuckGo search via duck-duck-scrape
  try {
    const { search } = require('duck-duck-scrape');
    const ddgResults = await search(query);
    if (ddgResults && ddgResults.results && ddgResults.results.length > 0) {
      const hits = ddgResults.results.slice(0, 3).map((r: any) => `Search Result: ${r.title} - ${r.description}`).join('\n');
      context += `DuckDuckGo Search Results:\n${hits}\n\n`;
    }
  } catch (err) {
    console.warn("DuckDuckGo search via duck-duck-scrape failed, trying fallback...", err);
    // Fallback: Google search via googlethis
    try {
      const google = require('googlethis');
      const googleResults = await google.search(query, { hl: 'en', safe: false });
      let hits: string[] = [];
      if (googleResults.knowledge_panel?.description) {
        hits.push(`Knowledge Panel: ${googleResults.knowledge_panel.title} - ${googleResults.knowledge_panel.description}`);
      }
      if (googleResults.featured_snippet?.description) {
        hits.push(`Featured Snippet: ${googleResults.featured_snippet.title} - ${googleResults.featured_snippet.description}`);
      }
      googleResults.results.slice(0, 3).forEach((r: any) => {
        hits.push(`Search Result: ${r.title} - ${r.description}`);
      });
      if (hits.length > 0) {
        context += `Google Search Results:\n${hits.join('\n')}\n\n`;
      }
    } catch (gErr) {
      console.warn("Google search via googlethis failed:", gErr);
    }
  }

  // 3. News RSS Search (Google News RSS - very reliable, no blocking)
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(rssUrl);
    const xml = await res.text();
    const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)].slice(1, 4).map(m => m[1]);
    if (titles.length > 0) {
      context += `Recent News:\n${titles.map(t => `- ${t}`).join('\n')}\n\n`;
    }
  } catch (err) {
    console.warn("Google News RSS search failed:", err);
  }

  return context.trim();
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

  await prisma.chatMessage.create({
    data: { sessionId, role: 'user', content: userMessage },
  });

  let assistantMessage = '';

  if (shouldMock()) {
    assistantMessage = `I'm your AI tutor! You said: "${userMessage}". I am currently operating in offline mode, but I'm still here to help you study.`;
  } else {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const searchContext = await getRealtimeContext(userMessage);

      const systemPrompt = session.note
        ? `You are a helpful and dedicated AI study tutor. Today's date is ${currentDate}.

Real-time Search Context:
${searchContext}

STUDY MATERIAL:
${session.note.content}

CRITICAL RULES:
1. You are a dedicated study assistant and tutor. You must ONLY answer educational, academic, or study-related questions. If the user asks off-topic, non-educational, or non-academic questions (e.g., casual chitchat, gaming, entertainment, recipes, or tasks unrelated to studying), you must politely decline to answer and guide them back to their studies.
2. You are integrated with a live search engine that provides you with real-time data in the search context above. Do NOT mention that you run searches or have search tools. Do NOT say you don't have access to real-time data or mention a knowledge cutoff. Act as if you natively know this information.
3. Answer questions based on the study material and the real-time search context above. Be clear, encouraging, and educational.`
        : `You are a helpful and dedicated AI study tutor. Today's date is ${currentDate}.

Real-time Search Context:
${searchContext}

CRITICAL RULES:
1. You are a dedicated study assistant and tutor. You must ONLY answer educational, academic, or study-related questions. If the user asks off-topic, non-educational, or non-academic questions (e.g., casual chitchat, gaming, entertainment, recipes, or tasks unrelated to studying), you must politely decline to answer and guide them back to their studies.
2. You are integrated with a live search engine that provides you with real-time data in the search context above. Do NOT mention that you run searches or have search tools. Do NOT say you don't have access to real-time data or mention a knowledge cutoff. Act as if you natively know this information.
3. Answer the user's question accurately using the real-time search context if relevant. Be clear, encouraging, and educational.`;

      const formattedMessages: ChatMessageInput[] = [
        { role: 'system', content: systemPrompt },
      ];

      session.messages.forEach(m => {
        formattedMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        });
      });
      
      formattedMessages.push({ role: 'user', content: userMessage });

      assistantMessage = await callAiChat(formattedMessages);
    } catch (error) {
      console.warn("AI tutor chat error, using fallback mock:", error);
      assistantMessage = `I'm your AI tutor! You said: "${userMessage}". I am currently operating in offline mode, but I'm still here to help you study.`;
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

export async function deleteChatSession(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  
  return prisma.chatSession.delete({
    where: { id: sessionId },
  });
}

// ── Quizzes Hub ────────────────────────────────────────────────────────────

export async function getAllQuizzes(userId: string) {
  return prisma.quiz.findMany({
    where: { note: { userId } },
    orderBy: { createdAt: 'desc' },
    include: { 
      note: { select: { title: true } },
      questions: true,
      attempts: {
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }
    },
  });
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, totalQuestions: number) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, note: { userId } } });
  if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 });

  return prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions
    }
  });
}

// ── Flashcards Hub ─────────────────────────────────────────────────────────

export async function getAllFlashcardDecks(userId: string) {
  return prisma.flashcardDeck.findMany({
    where: { note: { userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      note: { select: { title: true } },
      flashcards: true
    }
  });
}

// ── Planner Hub ────────────────────────────────────────────────────────────

export async function getPlannerEvents(userId: string) {
  return prisma.studyEvent.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });
}

export async function createPlannerEvent(userId: string, title: string, date: Date, type: string, color: string) {
  return prisma.studyEvent.create({
    data: {
      userId,
      title,
      date,
      type,
      color
    }
  });
}

export async function deletePlannerEvent(userId: string, eventId: string) {
  const event = await prisma.studyEvent.findFirst({ where: { id: eventId, userId } });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  return prisma.studyEvent.delete({ where: { id: eventId } });
}

