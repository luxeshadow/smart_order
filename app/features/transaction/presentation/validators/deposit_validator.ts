export class DepositValidator {

  static validate(params: any): string | null {
    if (!params.depositPhoneNumber || !params.amount || !params.method) {
      return "Tous les champs sont obligatoires.";
    }

    const cleanPhone = String(params.depositPhoneNumber).replace(/\s/g, '');
    if (cleanPhone.length < 8) {
      return "Le numéro de téléphone n'est pas valide.";
    }

    const amountValue = Number(params.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Le montant doit être un nombre supérieur à 0.";
    }

    if (amountValue < 1) {
      return "Le montant minimum est de 1 FCFA.";
    }

    return null;
  }
}