// ─── Helpers ────────────────────────────────────────────────────────────────

function createCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  gain: number,
  start: number,
  duration: number,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

// ─── Recepción — campana suave ───────────────────────────────────────────────
// Tres tonos ascendentes con sine: A5 → C#6 → E6
export function playOrderNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 'sine', 880,  0.28, t,        0.35);
  tone(ctx, 'sine', 1108, 0.28, t + 0.20, 0.35);
  tone(ctx, 'sine', 1320, 0.28, t + 0.40, 0.55);
  setTimeout(() => ctx.close(), 2000);
}

// ─── Cocina — alarma agresiva ────────────────────────────────────────────────
// Sawtooth (máximos armónicos) en 3 dobles-pulsos rápidos → corta el ruido de cocina
export function playKitchenNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Cada burst: dos pips cortos con forma sawtooth + alta ganancia
  const burst = (offset: number) => {
    tone(ctx, 'sawtooth', 1100, 0.65, t + offset,        0.12);
    tone(ctx, 'sawtooth', 1320, 0.65, t + offset + 0.16, 0.12);
  };

  burst(0.00); // burst 1
  burst(0.42); // burst 2
  burst(0.84); // burst 3

  setTimeout(() => ctx.close(), 3500);
}

// ─── Éxito — acorde mayor feliz ──────────────────────────────────────────────
// Do4 → Mi4 → Sol4 → Do5 (acorde de Do mayor arpegiado)
export function playSuccessNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 'sine', 523,  0.25, t,        0.25);
  tone(ctx, 'sine', 659,  0.25, t + 0.12, 0.25);
  tone(ctx, 'sine', 784,  0.25, t + 0.24, 0.25);
  tone(ctx, 'sine', 1046, 0.30, t + 0.36, 0.40);
  setTimeout(() => ctx.close(), 2000);
}

// ─── Courier / domiciliario ───────────────────────────────────────────────────
// Dos tonos descendentes + rebote: patrón de "salida a entregar"
export function playCourierNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 'triangle', 880, 0.30, t,        0.20);
  tone(ctx, 'triangle', 660, 0.30, t + 0.18, 0.20);
  tone(ctx, 'triangle', 880, 0.22, t + 0.42, 0.30);
  setTimeout(() => ctx.close(), 2000);
}

// ─── Alerta urgente ──────────────────────────────────────────────────────────
// Pulso square repetido en rojo: para errores o estados críticos
export function playAlertNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 0.22, 0.44].forEach((offset) => {
    tone(ctx, 'square', 950, 0.45, t + offset, 0.18);
  });
  setTimeout(() => ctx.close(), 2000);
}
