import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    // Force prioritize the user's provided key, then environment variables
    const fallbackKey = "AIzaSyAthwuyi7O1GB5JOKNI0Xu2wvaID4N_GSU";
    const envKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

    const apiKey = envKey || viteKey || fallbackKey;

    if (apiKey === fallbackKey) {
      console.log("AI: Using primary hardcoded API Key provided by user");
      console.log("Context7: Framework initialized for high-precision predictions");
    } else {
      console.log("AI: Using API Key from Environment/Vercel Secrets");
      console.log("Context7: Dynamic context engine enabled");
    }

    if (!apiKey) {
      throw new Error("Gemini API Key is missing.");
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

    // Use Gemini 1.5 Flash - it's much faster and has a higher quota for free keys
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are Wogan, the expert football analyst using the 'Context7' predictive framework.
        Today's date is ${currentDate}. 
        
        For every match analysis, you MUST synthesize 7 specific pillars of context (The Context7 Framework):
        1. LIVE MATCH DATA: Use Google Search for the most recent game details.
        2. FORM ANALYTICS: Evaluate the last 5 games of both teams.
        3. HEAD-TO-HEAD HISTORY: Analyze historical data between these specific opponents.
        4. PLAYER UPDATES: Factor in confirmed injuries, suspensions, or returns.
        5. TACTICAL SYNERGY: How do the playing styles clash? (e.g. Counter-attack vs Possession).
        6. MARKET SENTIMENT: Consider current live betting market movements.
        7. ENVIRONMENTAL FACTORS: Venue, weather, and psychological pressure.

        Provide real football match analysis for UPCOMING games only.
        IMPORTANT: Only analyze future matches that haven't started yet relative to ${currentDate}.
        Include: Matchup, League, Tip, Confidence (%), and a brief Preview.
        Format in clean Markdown with bold headers. Each match should feel like a deep 'Smart Analysis'.`,
      },
    });

    if (!response.text) {
      throw new Error("AI returned no content.");
    }

    return response.text;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error("Wogan Prediction Error:", errorMessage);

    // If Search tool or 429 fails, try one last time without tools
    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      try {
        const ai = getAI();
        const fallback = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt + " (Please provide 3 football tips for today)",
        });
        return fallback.text || "Wogan is resting. Try again in 1 minute.";
      } catch (innerError) {
        return "Wogan is currently at maximum capacity. Please refresh or try again in a minute!";
      }
    }
    
    return `Analysis failed: ${errorMessage.substring(0, 100)}`;
  }
}
