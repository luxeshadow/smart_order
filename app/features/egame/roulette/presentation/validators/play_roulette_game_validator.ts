// features/transaction/presentation/validators/play_roulette_game_validator.ts
export class PlayRouletteGameValidator {
  static validate(params: any): string | null {
    if (!params.userId) {
      return "L'identifiant de l'utilisateur est obligatoire.";
    }

    if (params.betAmount === undefined || params.betAmount === null) {
      return "Le montant de la mise est obligatoire.";
    }

    const betValue = Number(params.betAmount);
    if (isNaN(betValue) || betValue <= 0) {
      return "Le montant de la mise doit être un nombre supérieur à 0.";
    }

    if (betValue < 500) {
      return "La mise minimale est de 500 XOF.";
    }

    return null;
  }
}