export class UpdateProfileValidator {
  static validate(params: { userName: string; phoneNumber: string; email: string }): string | null {
    
    // 1. Vérification des champs vides
    if (!params.userName || params.userName.trim() === "") {
      return "Le nom d'utilisateur est obligatoire.";
    }
    if (!params.phoneNumber || params.phoneNumber.trim() === "") {
      return "Le numéro de téléphone est obligatoire.";
    }
    if (!params.email || params.email.trim() === "") {
      return "L'adresse email est obligatoire.";
    }

    const userRegex = /^[a-zA-Z0-9_]{3,}$/; 
    if (!userRegex.test(params.userName)) {
      return "Le nom d'utilisateur doit contenir au moins 3 caractères alphanumériques.";
    }

    const phoneRegex = /^\+?[0-9]{8,15}$/; 
    if (!phoneRegex.test(params.phoneNumber.replace(/\s/g, ''))) {
      return "Le numéro de téléphone n'est pas valide.";
    }

    // 4. Format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      return "L'adresse email n'est pas valide.";
    }

    return null;
  }
}