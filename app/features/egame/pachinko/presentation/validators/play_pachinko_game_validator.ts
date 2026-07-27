import type { PlayPachinkoGameParam } from '../../application/params/play_pachinko_game_params'

export class PlayPachinkoGameValidator {
  
  static validate(params: PlayPachinkoGameParam): string | null {

    if (!params.userId) return "L'identifiant de l'utilisateur est obligatoire."
    if (params.betAmount === undefined || params.betAmount === null) return 'Le montant de la mise est obligatoire.'

    const betValue = Number(params.betAmount)
    if (Number.isNaN(betValue) || betValue <= 0) return 'Le montant de la mise doit être un nombre supérieur à 0.'
    if (betValue < 500) return 'La mise minimale est de 500 XOF.'

    return null
  }
}
