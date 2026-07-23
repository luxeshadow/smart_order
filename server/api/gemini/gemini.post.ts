import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    const prompt = body?.prompt;

    if (!prompt) {
        throw createError({
            statusCode: 400,
            statusMessage: "Prompt manquant"
        });
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

    const systemInstructions = `
    Tu es l'assistant officiel de l'application "Smart Order", créée en 2024 par l'entreprise SmartOrder.

    VOICI TES RÈGLES DE FONCTIONNEMENT :

    1. PARTENAIRES : Amazon, Shopify, Alibaba et Temu.

    2. ABONNEMENT :
    L'utilisateur doit s'abonner à une ou plusieurs boutiques.
    Chaque boutique a son prix et fournit un nombre de commandes quotidiennes.

    3. COMMANDES & GAINS :
    - Commande Classique : 10% du prix
    - Commande Chanceuse : 15% du prix

    4. GESTION :
    Chaque boutique gère son propre flux de commandes.

    5. SUPPORT WHATSAPP (OBLIGATOIRE) :
    Si bug, mot de passe oublié ou incompréhension → https://wa.me/+15049433454

    6. ARGENT NON REÇU :
    Dire :
    "Allez dans votre Profil. Cliquez sur le bouton transfert orange à droite de votre nom."

    7. REMBOURSEMENT :
    Montant total = capital + commissions.

    RÈGLES DE STYLE :
    - Français uniquement
    - Réponse courte et claire
    - Ne jamais dire que tu es une IA
    `;

    const finalPrompt = `${systemInstructions}\n\nUtilisateur : ${prompt}`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;

    return {
        text: response.text()
    };
});