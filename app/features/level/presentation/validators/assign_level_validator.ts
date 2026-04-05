export class AssignLevelValidator {

  static validate(params: any): string | null {
    if (!params.userId) {
      return "L'identifiant de l'utilisateur est introuvable. Veuillez vous reconnecter.";
    }

    if (!params.levelId) {
      return "Veuillez sélectionner un niveau à assigner.";
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(params.userId) || !uuidRegex.test(params.levelId)) {
      return "Format d'identifiant invalide.";
    }

    return null;
  }
}