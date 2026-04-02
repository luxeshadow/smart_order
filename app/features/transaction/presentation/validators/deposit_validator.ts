export class DepositValidator {

  static validate(params: any): string | null {
    // 1. Vérification des champs obligatoires
    if (!params.phoneNumber || !params.amount || !params.method) {
      return "Tous les champs sont obligatoires.";
    }

    // 2. Validation du numéro de téléphone (nettoyage des espaces)
    const cleanPhone = String(params.phoneNumber).replace(/\s/g, '');
    if (cleanPhone.length < 8) {
      return "Le numéro de téléphone n'est pas valide.";
    }

    // 3. Validation du montant (doit être un nombre et > 0)
    const amountValue = Number(params.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Le montant doit être un nombre supérieur à 0.";
    }

    // Optionnel : Limite basse pour éviter les transactions inutiles
    if (amountValue < 1000) {
      return "Le montant minimum est de 1000 FCFA.";
    }

    return null;
  }
}