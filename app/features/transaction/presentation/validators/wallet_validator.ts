export class WalletValidator {
  static validate(params: { phoneNumber: string; withdrawPassword: string }): string | null {
    if (!params.phoneNumber || !params.withdrawPassword) {
      return "Tous les champs sont obligatoires.";
    }

    const cleanPhone = String(params.phoneNumber).replace(/\s/g, '');
    if (cleanPhone.length < 8) {
      return "Le numéro de téléphone doit contenir au moins 8 chiffres.";
    }

    if (params.withdrawPassword.length < 4) {
      return "Le mot de passe de retrait doit contenir au moins 4 caractères.";
    }

    return null;
  }
}