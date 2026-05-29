import { Groq } from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is not set. AI features will fallback to mock data.');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'missing',
});
