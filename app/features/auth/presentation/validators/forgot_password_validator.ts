export class ForgotPasswordValidator {
  static validate(params: any): string | null {
    
    if (!params.email) {
      return "L'adresse email est obligatoire.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      return "L'adresse email n'est pas valide.";
    }

    return null;
  }
}