// core/constants/roulette_constants.ts ou features/transaction/constants/roulette_constants.ts

export interface RouletteSlice {
  type: 'skull' | 'win'
  label: string
  mult: number
}

export const ROULETTE_SLICES: RouletteSlice[] = [
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.25x', mult: 1.25 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.5x', mult: 1.5 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '2x', mult: 2 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.25x', mult: 1.25 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.75x', mult: 1.75 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '5x', mult: 5 }
]