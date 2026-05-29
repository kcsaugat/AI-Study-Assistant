require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: 'who is the prime minister of nepal' }],
    model: 'llama-3.1-8b-instant',
    tools: [
      {
        type: "function",
        function: {
          name: "searchWikipedia",
          description: "Search Wikipedia for real-time and up-to-date information. Use this whenever the user asks for facts.",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"]
          }
        }
      }
    ]
  });
  console.log(chatCompletion.choices[0].message.tool_calls);
}
test();
