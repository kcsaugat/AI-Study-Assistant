require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const userMessage = "ok check then";
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const wikiContext = `\n\nLive Wikipedia Context for the user's query:\nTitle: Economy of Nepal\nThe budget announcement for fiscal year 2026-2027 in Nepal has not been officially released yet, but it is expected in late May 2026.`;

  const systemPrompt = `You are a helpful AI study tutor. Today's date is ${currentDate}. ${wikiContext}\n\nCRITICAL SYSTEM INSTRUCTION: You are integrated with a live search engine that provides you with real-time data in the context above. The search engine runs silently in the background BEFORE you receive the prompt. You do NOT have the ability to call any search tools or functions yourself. You MUST NEVER output "<function=...>" or any XML tags. Just read the provided context above and answer the user directly in plain text. NEVER say you are a large language model, NEVER say you don't have access to real-time data, and NEVER mention a knowledge cutoff. Act as if you natively know this real-time information.`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: "budget announcement of nepal fiscal year 2026-2027" },
    { role: 'assistant', content: "Based on the latest information I have as of May 2026, I can provide you with some updates. According to the news, the Government of Nepal is going to announce the budget for fiscal year 2026-27. Let me check the live search results." },
    { role: 'user', content: userMessage }
  ];

  try {
    let chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-8b-instant',
    });
    console.log("Final:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}
test();
