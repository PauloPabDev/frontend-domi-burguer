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

// ─── Cocina — alarma klaxon industrial ───────────────────────────────────────
// Sawtooth + Square apilados → WaveShaper distorsión → DynamicsCompressor.
// Patrón klaxon ALTO-BAJO × 4 pips, dos ciclos. Corta el ruido de cocina.
export function playKitchenNotification(): void {
  const ctx = createCtx();
  if (!ctx) return;

  // Curva de distorsión soft-clip con drive alto
  const distortion = ctx.createWaveShaper();
  const samples = 512;
  const curve = new Float32Array(samples);
  const drive = 280;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((Math.PI + drive) * x) / (Math.PI + drive * Math.abs(x));
  }
  distortion.curve = curve;
  distortion.oversample = '4x';

  // Compresor — maximiza volumen percibido
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-4, ctx.currentTime);
  comp.knee.setValueAtTime(0, ctx.currentTime);
  comp.ratio.setValueAtTime(20, ctx.currentTime);
  comp.attack.setValueAtTime(0.001, ctx.currentTime);
  comp.release.setValueAtTime(0.05, ctx.currentTime);

  distortion.connect(comp);
  comp.connect(ctx.destination);

  // Pip: sawtooth + square ligeramente desafinados → beating + dureza máxima
  const pip = (freq: number, start: number, dur: number) => {
    (['sawtooth', 'square'] as OscillatorType[]).forEach((type, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(distortion);
      osc.type = type;
      osc.frequency.setValueAtTime(freq + i * 8, start); // +8 Hz detune → beating
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.45, start + 0.003); // ataque fulminante
      g.gain.setValueAtTime(0.45, start + dur - 0.015);
      g.gain.linearRampToValueAtTime(0, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    });
  };

  const t = ctx.currentTime;
  const HI = 1380;
  const LO = 1020;
  const pipDur = 0.10;
  const step   = pipDur + 0.025; // 0.125s por pip

  // Un ciclo: HI-LO-HI-LO
  const cycle = (offset: number) => {
    pip(HI, t + offset + 0 * step, pipDur);
    pip(LO, t + offset + 1 * step, pipDur);
    pip(HI, t + offset + 2 * step, pipDur);
    pip(LO, t + offset + 3 * step, pipDur);
  };

  cycle(0);

  setTimeout(() => ctx.close(), 1500);
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
