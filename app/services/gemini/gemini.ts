import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (prompt: string) => {
  const config = useRuntimeConfig();
  const apiKey = config.public.geminiApiKey;

  if (!apiKey) {
    throw new Error("Clé API Gemini manquante.");
  }

  // Initialisation du SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  // Configuration du prompt système pour Benoit
  const finalPrompt = `
Tu es un assistant intelligent.
RÈGLE OBLIGATOIRE :
- Réponds uniquement en français
- Sois clair, professionnel et utile
- Si la question est dans une autre langue, traduis mentalement et réponds en français
- Ne mélange jamais avec l'anglais

Question utilisateur : ${prompt}`;

  try {
    // Utilisation du modèle stable gemini-1.5-flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });
    
    // On envoie le prompt formaté avec tes instructions
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Erreur détaillée Gemini:", error);
    throw new Error("L'IA est momentanément indisponible.");
  }
};