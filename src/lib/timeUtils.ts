export function formatTimeToClockTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(1);
  return `${minutes}:${remainingSeconds.padStart(4, '0')}`;
}

export function parseClockTimeToSeconds(clockTime: string): number {
  const [minutes, seconds] = clockTime.split(':').map(Number);
  return minutes * 60 + seconds;
} 