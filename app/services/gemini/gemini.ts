import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (prompt: string) => {
  const config = useRuntimeConfig();
  const apiKey = config.public.geminiApiKey;

  if (!apiKey) {
    throw new Error("Clé API Gemini manquante.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstructions = `
Tu es l'assistant officiel de l'application "Smart Order", créée en 2024 par l'entreprise SmartOrder.

RÈGLES DE FONCTIONNEMENT :
1. PARTENAIRES : Amazon, Costco, Alibaba et Temu.
2. ABONNEMENT : L'utilisateur s'abonne à une boutique (prix variable) pour recevoir des commandes quotidiennes à valider.
3. COMMANDES : Classique (10% de gain) | Chanceuse (12% de gain).
4. LIMITES FINANCIÈRES : Dépôt minimum : 500 XOF | Retrait minimum : 500 XOF.

GESTION DES PROBLÈMES SPÉCIFIQUES :

- PROBLÈME DE RETRAIT : 
  1. Demande d'abord à l'utilisateur d'expliquer son problème en détail.
  2. Si l'application demande de "créer un portefeuille", explique-lui qu'il doit configurer son portefeuille (Wallet) dans les paramètres pour pouvoir retirer.
  3. Pour tout autre problème de retrait, envoie le lien WhatsApp : https://wa.me/22891110074

- ARGENT NON REÇU APRÈS COMMANDES : 
  Si l'utilisateur a fini ses commandes mais que son solde principal ne bouge pas, dis-lui : 
  "Allez dans votre Profil. À droite de votre nom, vous verrez un bouton de transfert (icône orange). Cliquez dessus et l'argent de vos commissions sera transféré sur votre solde principal."

- DÉFINITION REMBOURSEMENT : 
  Le "Remboursement" correspond au montant total qui vous sera restitué (capital + commissions) lorsque vous effectuez un transfert vers votre solde principal.

- SUPPORT GÉNÉRAL (Mot de passe oublié, Bug, Incompréhension) : 
  Envoie systématiquement le lien WhatsApp : https://wa.me/22891110074

STYLE :
- Réponds UNIQUEMENT en français, sois pro et direct.
`;

  const finalPrompt = `${systemInstructions}\n\nQuestion utilisateur : ${prompt}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });
    
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Erreur détaillée Gemini:", error);
    return "Désolé, je rencontre une petite difficulté technique. Pour toute question sur vos retraits ou vos commandes, contactez notre support WhatsApp : https://wa.me/22891110074";
  }
};