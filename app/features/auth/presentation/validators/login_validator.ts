export class LoginValidator {
  static validate(params: any, confirmPassword?: string): string | null {
    if (!params.phoneNumber || !params.password) {
      return "Tous les champs sont obligatoires.";
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(params.phoneNumber)) {
      return "Le numéro de téléphone n'est pas valide.";
    }

    if (params.password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    
    if (confirmPassword !== undefined && params.password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }
    return null;
  }
}