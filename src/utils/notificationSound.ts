/**
 * Generates a kitchen-order notification sound using the Web Audio API.
 * Three ascending tones — like a restaurant bell. No audio file required.
 */
export function playOrderNotification(): void {
  if (typeof window === 'undefined') return;

  try {
    const ctx = new AudioContext();

    const playTone = (frequency: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
    };

    const t = ctx.currentTime;
    playTone(880,  t,        0.35); // A5
    playTone(1108, t + 0.2,  0.35); // C#6
    playTone(1320, t + 0.4,  0.55); // E6

    setTimeout(() => ctx.close(), 2000);
  } catch {
    // AudioContext not available (e.g. SSR or restricted browser)
  }
}
