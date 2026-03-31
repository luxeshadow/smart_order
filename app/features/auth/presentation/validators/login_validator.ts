export class LoginValidator {

  static validate(params: any): string | null {
    if ((!params.email && !params.phoneNumber) || !params.password) {
      return "Tous les champs sont obligatoires.";
    }

    if (params.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.email)) {
        return "L'adresse email n'est pas valide.";
      }
    }

    if (params.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(params.phoneNumber)) {
        return "Le numéro de téléphone n'est pas valide.";
      }
    }
    if (params.password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }

    return null;
  }
}