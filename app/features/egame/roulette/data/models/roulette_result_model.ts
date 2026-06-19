import type { RouletteResult } from '../../domain/entities/roulette_result';

export class RouletteResultModel implements RouletteResult {
  constructor(
    public winningIndex: number,
    public gains: number,
    public isWin: boolean
  ) {}

  static fromRaw(data: { winningIndex: number; gains: number; isWin: boolean }): RouletteResultModel {
    return new RouletteResultModel(
      data.winningIndex,
      data.gains,
      data.isWin
    );
  }
}