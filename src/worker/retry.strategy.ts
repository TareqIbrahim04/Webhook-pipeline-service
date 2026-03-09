export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelayMs = 2000
): number {
  // Exponential backoff
  return baseDelayMs * Math.pow(2, attemptNumber - 1);
}
