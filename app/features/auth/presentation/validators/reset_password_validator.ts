export class ResetPasswordValidator {
  static validate(params: any): string | null {
    if (!params.password || !params.confirmPassword) {
      return "Veuillez remplir tous les champs.";
    }

    if (params.password.length < 6) {
      return "Le nouveau mot de passe doit contenir au moins 6 caractères.";
    }

    if (params.password !== params.confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }

    return null;
  }
}