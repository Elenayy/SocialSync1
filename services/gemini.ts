
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client. 
// The API_KEY is injected by Vite during the build process from your Vercel Environment Variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateEventDescription = async (eventName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a catchy 2-sentence description for an offline event called "${eventName}" in the "${category}" category to attract companions.`,
    });
    return response.text?.trim() || "Join us for this amazing event!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Let's explore this together!";
  }
};

export const suggestRegistrationMessage = async (eventName: string, userBio: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a friendly 1-sentence message for a person with this bio: "${userBio}" who wants to join an event called "${eventName}". Make it sound enthusiastic and genuine.`,
    });
    return response.text?.trim() || "Hi! I'd love to join this activity.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hey! This sounds great, I'd love to tag along.";
  }
};

export const generateBioFromInterests = async (interests: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a fun, 150-character profile bio for a person interested in: ${interests.join(', ')}. Make it sound social and inviting.`,
    });
    return response.text?.trim() || "Social soul ready for new adventures!";
  } catch (error) {
    return "Exploring the world one event at a time.";
  }
};

export const getSmartRecommendations = async (userBio: string, activities: string) => {
  try {
    if (!activities) return "";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this user bio: "${userBio}", and this list of available activities (names and descriptions): ${activities}, recommend the top 2 activities. Return the names only.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    return "";
  }
};
