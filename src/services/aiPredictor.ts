import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    // Check multiple possible locations for the API key
    const envKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const fallbackKey = "AIzaSyAthwuyi7O1GB5JOKNI0Xu2wvaID4N_GSU";

    const apiKey = envKey || viteKey || fallbackKey;

    if (envKey) console.log("AI: Using GEMINI_API_KEY from process.env");
    else if (viteKey) console.log("AI: Using VITE_GEMINI_API_KEY from import.meta.env");
    else console.log("AI: Using fallback hardcoded API key");

    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY or VITE_GEMINI_API_KEY.");
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

    // Try with gemini-2.0-flash first as it's more stable for grounding
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are an expert football analyst and tipster named 'Wogan'. 
        Today's date is ${currentDate}. 
        Use Google Search to find real, UPCOMING football matches for today or tomorrow. 
        IMPORTANT: Only analyze future matches that haven't started yet relative to ${currentDate}.
        For each match provide: Matchup, League, Tip, Confidence (%), and a brief Preview.
        Format in Markdown with bold headers.`,
      },
    });

    if (!response.text) {
      // Fallback: Try without search if search failed/returned empty
      console.warn("AI search returned empty, trying basic match generation...");
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Give me some plausible upcoming football match predictions for " + currentDate,
        config: {
          systemInstruction: "You are Wogan, a football expert. Predict 3 upcoming matches for today. Use recent real-world knowledge.",
        }
      });
      return fallbackResponse.text || "I couldn't find matches to analyze right now. Please try again soon!";
    }

    return response.text;
  } catch (error: any) {
    console.error("AI Prediction Error Details:", error);
    
    // Explicitly show the error message in the UI for the user to debug
    const errorMessage = error?.message || "Unknown error";
    
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
      return "Wogan is currently overloaded with requests! (API Quota Exceeded). Please wait 60 seconds and try again.";
    }
    if (errorMessage.includes("API_KEY_INVALID")) {
      return "Error: API Key is invalid. Please check your configuration.";
    }
    if (errorMessage.includes("PERMISSION_DENIED")) {
      return "Error: API Key does not have permission for Gemini. Enable it in Google Cloud Console.";
    }
    if (errorMessage.includes("model is not found")) {
      return "Error: AI Model 'gemini-2.0-flash' not supported by this key.";
    }
    
    return `Analysis failed: ${errorMessage.substring(0, 100)}.`;
  }
}
