export const askGemini = async (prompt: string) => {
  try {
    const res: any = await $fetch("/api/gemini/gemini", {
      method: "POST",
      body: { prompt }
    });

    return res.text;
  } catch (error: any) {
    console.error("Erreur Gemini:", error);

    return "Erreur serveur. Contact support : https://wa.me/+15049433454";
  }
};