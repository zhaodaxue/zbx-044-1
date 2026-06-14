export type Level = 'beginner' | 'advanced';

export type FilterMode = 'all' | 'beginner' | 'advanced';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  waveHeight: number;
  windLevel: number;
  suggestedLevel: Level;
  safetyTips: [string, string, string];
}
