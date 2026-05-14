import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPredictions(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert football analyst and tipster named 'Wogan'. 
        The user is asking for today's predictions. 
        Create 3-4 realistic-sounding UPCOMING matches for today or tomorrow (various leagues like PL, La Liga, UCL). 
        IMPORTANT: Only analyze future matches that haven't started yet.
        For each match provide:
        - Matchup (Team A vs Team B)
        - League
        - Tip (e.g., 1X2, Over/Under, BTTS)
        - Confidence (%)
        - Match Preview (1-2 sentences)
        Format your response in Markdown. Use Bold headers for match titles. Use a card-like structure for each match. Use a professional, expert tone.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return "I'm having trouble analyzing the pitches right now. Please try again in a moment!";
  }
}
