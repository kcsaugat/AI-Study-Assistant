import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will fallback to mock data.');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? 'missing');
