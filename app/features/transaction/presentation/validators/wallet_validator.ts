export class WalletValidator {
  static validate(params: any): string | null {
    if (!params.paymentAddress || !params.withdrawalPassword) {
      return "Tous les champs sont obligatoires."
    }

    // nettoyage
    const cleanPhone = String(params.paymentAddress)
      .replace(/\s/g, '')
      .replace('+', '')
      .replace(/^00/, '')

    // uniquement chiffres
    if (!/^\d+$/.test(cleanPhone)) {
      return "Le numéro doit contenir uniquement des chiffres."
    }

    // longueur réaliste internationale (8 à 15 chiffres)
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return "Le numéro doit être au format international valide (ex: 228XXXXXXXX)."
    }

    if (cleanPhone.length < 10) {
      return "Ajoute l'indicatif pays (ex: 228..., 33..., 1...)."
    }

    if (params.withdrawalPassword.length < 4) {
      return "Le mot de passe de retrait doit contenir au moins 4 caractères."
    }

    return null
  }
}