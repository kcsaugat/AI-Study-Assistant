import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyB527Aw_UEw7-hj_J4KUlRn1tusG78vYYI";
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `You are a flashcard generator. Create exactly 2 study flashcards from the provided notes.
Return ONLY valid JSON in this format:
[
  { "front": "term or question", "back": "definition or answer" }
]
Notes:
Water is wet.`;

    const result = await model.generateContent(prompt);
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
