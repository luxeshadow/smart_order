export class RegisterValidator {
  static validate(params: any, confirmPassword?: string): string | null {
    if (!params.userName || !params.phoneNumber || !params.password) {
      return "Tous les champs sont obligatoires.";
    }

    const userRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!userRegex.test(params.userName)) {
      return "Le nom d'utilisateur doit contenir au moins 3 caractères alphanumériques.";
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