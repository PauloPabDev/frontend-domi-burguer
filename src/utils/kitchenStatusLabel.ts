import { KitchenOpenStatus } from "@/types/kitchens";

export type KitchenStatusTone = "open" | "warning" | "closed" | "unknown";

/** Colores de la píldora/línea de estado según el tono */
export const TONE_STYLES: Record<KitchenStatusTone, string> = {
  open: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  closed: "bg-red-50 text-red-600",
  unknown: "bg-neutral-black-10 text-neutral-black-60",
};

export interface KitchenStatusLabel {
  /** Frase completa en una línea */
  text: string;
  tone: KitchenStatusTone;
  /** Para mostrar en dos niveles: titular corto, detalle y tiempo que falta */
  headline: string;
  detail?: string;
  countdown?: string;
}

const TZ = "America/Bogota";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }); // yyyy-mm-dd
const weekdayFmt = new Intl.DateTimeFormat("es-CO", { timeZone: TZ, weekday: "long" });

const formatTime = (d: Date) => timeFmt.format(d); // "4:30 PM"
const dayIndex = (d: Date) => Date.parse(dayKeyFmt.format(d)) / 86_400_000;

export function formatOpensAt(opensAt: Date, now: Date): string {
  const diffDays = dayIndex(opensAt) - dayIndex(now);
  const when = diffDays <= 0 ? "hoy" : diffDays === 1 ? "mañana" : `el ${weekdayFmt.format(opensAt)}`;
  return `${when} a las ${formatTime(opensAt)}`;
}

/** Minutos → «1 h 20 min» / «45 min» / «2 h». */
export function formatTimeUntil(totalMinutes: number): string {
  const minutes = Math.max(1, Math.ceil(totalMinutes));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/**
 * Texto de estado de una cocina. `nowMs` debe ser la hora del servidor (no la del dispositivo)
 * para que el contador no dependa de un reloj mal puesto.
 */
export function getKitchenStatusLabel(
  status: Pick<KitchenOpenStatus, "open" | "opensAt" | "closesAt">,
  nowMs: number,
  { showCountdown = false }: { showCountdown?: boolean } = {},
): KitchenStatusLabel {
  const now = new Date(nowMs);

  if (status.open === null) return { text: "Horario no disponible", tone: "unknown", headline: "Horario no disponible" };

  if (status.open) {
    const closesAt = status.closesAt ? new Date(status.closesAt) : null;
    if (!closesAt) return { text: "Abierto", tone: "open", headline: "Abierto" };

    const minutes = Math.max(0, Math.ceil((closesAt.getTime() - nowMs) / 60_000));
    if (minutes <= 10) {
      return { text: `Cerramos en ${minutes} min`, tone: "warning", headline: `Cerramos en ${minutes} min`, detail: "¡Pide ahora!" };
    }
    const closeAt = `cerramos a las ${formatTime(closesAt)}`;
    return {
      text: `Abierto · ${closeAt}`,
      tone: "open",
      headline: "Abierto",
      detail: closeAt[0].toUpperCase() + closeAt.slice(1),
    };
  }

  if (!status.opensAt) return { text: "Cerrado", tone: "closed", headline: "Cerrado por ahora" };
  const opensAt = new Date(status.opensAt);
  const opens = `abrimos ${formatOpensAt(opensAt, now)}`;
  const minutesToOpen = (opensAt.getTime() - nowMs) / 60_000;
  // «en 25 h 30 min» no ayuda: la cuenta regresiva solo si abren en menos de un día
  const countdown = showCountdown && minutesToOpen < 24 * 60 ? `en ${formatTimeUntil(minutesToOpen)}` : undefined;
  return {
    text: `Cerrado · ${opens}${countdown ? ` · ${countdown}` : ""}`,
    tone: "closed",
    headline: "Cerrado por ahora",
    detail: opens[0].toUpperCase() + opens.slice(1),
    countdown,
  };
}
