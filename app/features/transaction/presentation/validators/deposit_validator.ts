export class DepositValidator {

  static validate(params: any): string | null {
    if (!params.depositPhoneNumber || !params.amount || !params.method) {
      return "Tous les champs sont obligatoires.";
    }
    const cleanPhone = String(params.depositPhoneNumber).replace(/\s/g, '');

    const phoneWithPlusRegex = /^\+[1-9]\d{7,14}$/;

    if (!phoneWithPlusRegex.test(cleanPhone)) {
      return "Le numéro de téléphone doit commencer par l'indicatif avec '+' (ex: +22890000000).";
    }

    const amountValue = Number(params.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Le montant doit être un nombre supérieur à 0.";
    }

    if (amountValue < 10) {
      return "Le montant minimum est de 1000 FCFA.";
    }

    return null;
  }
}