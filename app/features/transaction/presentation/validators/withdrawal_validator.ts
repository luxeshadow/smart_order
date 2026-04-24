export class WithdrawalValidator {
  static validate(params: any): string | null {

    if (!params.phoneNumber || !params.amount || !params.password || !params.method) {
      return "Tous les champs marqués d'un astérisque sont obligatoires.";
    }

    // 🔥 nettoyage STRICT : on enlève tout sauf chiffres
    const cleanPhone = String(params.phoneNumber).replace(/\D/g, '')

    // doit être uniquement des chiffres
    if (!/^\d+$/.test(cleanPhone)) {
      return "Le numéro doit contenir uniquement des chiffres.";
    }

    // longueur internationale
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return "Le numéro doit être au format international (ex: 228XXXXXXXX).";
    }

    // doit contenir un indicatif (anti numéro local)
    if (cleanPhone.length < 10) {
      return "Ajoute l'indicatif pays (ex: 228..., 33..., 1...).";
    }

    if (params.method === 'ria') {
      if (!params.firstName || !params.lastName) {
        return "Le nom et le prénom sont obligatoires pour un retrait via Ria.";
      }
    }

    const amountValue = Number(params.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Le montant doit être un nombre supérieur à 0.";
    }

    if (amountValue < 500) {
      return "Le montant minimum de retrait est de 500 FCFA.";
    }

    if (String(params.password).length < 4) {
      return "Le mot de passe du wallet est trop court.";
    }

    return null;
  }
}