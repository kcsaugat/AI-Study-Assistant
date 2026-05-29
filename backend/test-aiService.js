require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const userMessage = "who is the prime minister of nepal";
  const systemPrompt = "You are a helpful AI study tutor. Search Wikipedia for real-time and up-to-date information.";
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "searchWikipedia",
        description: "Search Wikipedia for real-time and up-to-date information. Use this whenever the user asks for facts, current events, or information you don't know.",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      }
    }
  ];

  let chatCompletion = await groq.chat.completions.create({
    messages: formattedMessages,
    model: 'llama-3.1-8b-instant',
    tools,
  });

  const responseMessage = chatCompletion.choices[0]?.message;

  if (responseMessage?.tool_calls?.length) {
    formattedMessages.push(responseMessage);
    
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.function.name === 'searchWikipedia') {
        const args = JSON.parse(toolCall.function.arguments || '{}');
        try {
          const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(args.query)}&utf8=&format=json`;
          const searchRes = await fetch(searchUrl);
          const searchData = (await searchRes.json());
          
          let wikiContent = "No results found.";
          if (searchData.query?.search?.length > 0) {
            const topHit = searchData.query.search[0];
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${topHit.pageid}&format=json`;
            const extractRes = await fetch(extractUrl);
            const extractData = (await extractRes.json());
            const extract = extractData.query?.pages[topHit.pageid]?.extract || topHit.snippet.replace(/<[^>]+>/g, '');
            wikiContent = `Title: ${topHit.title}\n\n${extract}`;
          }
          
          formattedMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: wikiContent
          });
        } catch (err) {
          console.error(err);
        }
      }
    }

    chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-8b-instant',
    });
    console.log("Final answer:", chatCompletion.choices[0]?.message?.content);
  } else {
    console.log("Final answer:", responseMessage?.content);
  }
}
test();
