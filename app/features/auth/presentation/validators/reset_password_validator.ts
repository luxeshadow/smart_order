export class ResetPasswordValidator {
  static validate(params: any, confirmPassword?: string): string | null {
    if (!params.password) {
      return "Tous les champs sont obligatoires.";
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