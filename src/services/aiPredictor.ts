import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function getPredictions(prompt: string) {
  try {
    const ai = getAI();
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are an expert football analyst and tipster named 'Wogan'. 
        Today's date is ${currentDate}. 
        The user is asking for today's predictions. 
        Use Google Search to find real, UPCOMING football matches for today or tomorrow (various leagues like PL, La Liga, UCL, etc.). 
        IMPORTANT: Only analyze future matches that haven't started yet relative to ${currentDate}.
        For each match provide:
        - Matchup (Team A vs Team B)
        - League
        - Tip (e.g., 1X2, Over/Under, BTTS)
        - Confidence (%)
        - Match Preview (1-2 sentences)
        Format your response in Markdown. Use Bold headers for match titles. Use a card-like structure for each match. Use a professional, expert tone.`,
      },
    });

    return response.text || "I was unable to generate a response. Please try again later.";
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return "I'm having trouble analyzing the pitches right now. Please try again in a moment!";
  }
}
