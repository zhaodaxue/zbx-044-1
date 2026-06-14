import { TimeSlot, FilterMode } from '@/types'

export function sortByWaveHeight(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort((a, b) => a.waveHeight - b.waveHeight)
}

export function filterSlots(
  slots: TimeSlot[],
  mode: FilterMode
): TimeSlot[] {
  if (mode === 'all') return slots
  if (mode === 'beginner') {
    return slots.filter(
      (slot) => !(slot.waveHeight > 0.8 && slot.windLevel >= 4)
    )
  }
  if (mode === 'advanced') {
    return slots.filter((slot) => !(slot.waveHeight > 1.5))
  }
  return slots
}

export function isDangerWave(waveHeight: number): boolean {
  return waveHeight >= 1.2
}

export function getLevelLabel(level: 'beginner' | 'advanced'): string {
  return level === 'beginner' ? '入门' : '进阶'
}
