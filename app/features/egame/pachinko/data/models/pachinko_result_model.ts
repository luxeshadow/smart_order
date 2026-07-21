import type { PachinkoResult } from '../../domain/entities/pachinko_result'

export class PachinkoResultModel implements PachinkoResult {
  constructor(
    public winningIndex: number,
    public gains: number,
    public isWin: boolean
  ) {}
}
