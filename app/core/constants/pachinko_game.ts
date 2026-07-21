export interface PachinkoBucket {
  type: 'loss' | 'win'
  label: string
  mult: number
  color: string
}

export const PACHINKO_BUCKETS: PachinkoBucket[] = [
  { type: 'loss', label: '0x', mult: 0, color: '#ef4444' },
  { type: 'win', label: '1.5x', mult: 1.5, color: '#3b82f6' },
  { type: 'loss', label: '0x', mult: 0, color: '#ef4444' },
  { type: 'win', label: '3x', mult: 3, color: '#f97316' },
  { type: 'win', label: '10x', mult: 10, color: '#a855f7' },
  { type: 'win', label: '3x', mult: 3, color: '#f97316' },
  { type: 'loss', label: '0x', mult: 0, color: '#ef4444' },
  { type: 'win', label: '1.5x', mult: 1.5, color: '#3b82f6' },
  { type: 'loss', label: '0x', mult: 0, color: '#ef4444' }
]
