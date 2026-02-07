import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize the Gemini client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("Failed to initialize Gemini AI client:", error);
  }
} else {
  console.warn("Gemini API Key is missing. AI features will be disabled.");
}

/**
 * Encodes a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes product images to generate 3D model metadata and product details.
 * We use Gemini 3 Flash for speed and efficiency on basic multimodal tasks.
 */
export const generate3DModelData = async (imageBase64: string, mimeType: string): Promise<AIAnalysisResult> => {
  try {
    if (!ai) {
      throw new Error("Gemini API Key is not configured.");
    }

    // Switch to Flash for better rate limits and lower latency
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      You are an expert 3D modeling assistant.
      Analyze the 2D product image and determine the best 3D primitive shape ('box', 'cylinder', 'sphere', 'plane').
      Generate a catchy title, description, category, estimated price, and material analysis.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          {
            text: "Analyze this product image. Return a JSON object with product details.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            shape: { type: Type.STRING, enum: ["box", "cylinder", "sphere", "plane"] },
            materialAnalysis: { type: Type.STRING },
          },
          required: ["title", "description", "category", "estimatedPrice", "shape", "materialAnalysis"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as AIAnalysisResult;

  } catch (error: any) {
    console.error("Gemini AI generation failed:", error);

    // Check for quota exhaustion
    const isQuotaError = JSON.stringify(error).includes("429") || (error.message && error.message.includes("429"));
    const isMissingKey = error.message && error.message.includes("API Key is not configured");

    // Fallback if AI fails
    return {
      title: "New Product",
      description: isQuotaError
        ? "AI Quota Exceeded. Please enter product details manually."
        : isMissingKey
          ? "AI Configuration Missing. Please set GEMINI_API_KEY in environment variables."
          : "Automated description unavailable. Please enter details manually.",
      category: "General",
      estimatedPrice: 0,
      shape: "box",
      materialAnalysis: "Standard material",
    };
  }
};