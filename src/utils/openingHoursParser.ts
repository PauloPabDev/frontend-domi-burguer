/**
 * Parser para el formato OpenStreetMap de opening_hours
 * Usa la librería opening_hours.js para análisis robusto
 */

import OpeningHours from "opening_hours";

const DAY_MAP: Record<string, string> = {
  Mo: "Lunes",
  Tu: "Martes",
  We: "Miércoles",
  Th: "Jueves",
  Fr: "Viernes",
  Sa: "Sábado",
  Su: "Domingo",
};

const DAY_ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface ParsedSchedule {
  days: string;
  hours: string;
  startTime: string;
  endTime: string;
  daysArray: string[];
}

export interface OpeningHoursResult {
  schedules: ParsedSchedule[];
  isCurrentlyOpen: boolean;
  closingTime: string | null;
  timeUntilClose: { hours: number; minutes: number } | null;
}

// Configuración para Colombia (Bogotá)
const NOMINATIM_DATA = {
  lat: 4.6097,
  lon: -74.0817,
  address: {
    country_code: "co",
    country: "Colombia",
    state: "Bogotá",
  },
};

// El horario se guarda en UTC; a la gente se le muestra en hora de Bogotá (UTC-5, sin horario de verano)
const BOGOTA_OFFSET_MIN = -300;

/** "21:30" UTC → "16:30" Bogotá, y cuántos días se corre (-1 si pasa a la víspera). */
function utcToBogota(time: string): { time: string; dayShift: number } {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + BOGOTA_OFFSET_MIN;
  const local = ((total % 1440) + 1440) % 1440;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return { time: `${pad(Math.floor(local / 60))}:${pad(local % 60)}`, dayShift: Math.floor(total / 1440) };
}

function formatTime24to12(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hours12 = hours % 12 || 12;
  return `${hours12}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""} ${period}`;
}

function expandDayRange(dayRange: string): string[] {
  if (dayRange.includes("-")) {
    const [start, end] = dayRange.split("-");
    const startIdx = DAY_ORDER.indexOf(start);
    const endIdx = DAY_ORDER.indexOf(end);
    if (startIdx !== -1 && endIdx !== -1) {
      return DAY_ORDER.slice(startIdx, endIdx + 1);
    }
  }
  if (dayRange.includes(",")) {
    return dayRange.split(",").filter((d) => DAY_ORDER.includes(d));
  }
  if (DAY_ORDER.includes(dayRange)) {
    return [dayRange];
  }
  return [];
}

function formatDaysToSpanish(days: string[]): string {
  if (days.length === 0) return "";
  if (days.length === 1) return DAY_MAP[days[0]];
  if (days.length === 7) return "Todos los días";

  const indices = days.map((d) => DAY_ORDER.indexOf(d));
  const isConsecutive = indices.every(
    (val, i, arr) => i === 0 || val === arr[i - 1] + 1
  );

  if (isConsecutive && days.length > 2) {
    return `${DAY_MAP[days[0]]} a ${DAY_MAP[days[days.length - 1]]}`;
  }

  return days.map((d) => DAY_MAP[d]).join(", ");
}

function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseOpeningHours(openingHoursStr: string): OpeningHoursResult {
  const schedules: ParsedSchedule[] = [];
  const emptyResult: OpeningHoursResult = {
    schedules,
    isCurrentlyOpen: false,
    closingTime: null,
    timeUntilClose: null,
  };

  if (!openingHoursStr || openingHoursStr.trim() === "") {
    return emptyResult;
  }

  let oh: InstanceType<typeof OpeningHours>;
  try {
    oh = new OpeningHours(openingHoursStr, NOMINATIM_DATA);
  } catch (error) {
    console.error("Error parsing opening_hours:", error);
    return emptyResult;
  }

  // Extraer horarios para mostrar en la UI
  const rules = openingHoursStr.split(";").map((r) => r.trim());

  for (const rule of rules) {
    const match = rule.match(
      /^([A-Za-z,\-]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/
    );

    if (match) {
      const [, daysPart, utcStart, utcEnd] = match;
      const start = utcToBogota(utcStart);
      const startTime = start.time;
      const endTime = utcToBogota(utcEnd).time;
      // Si abrir en hora local cae el día anterior, los días de la regla también se corren
      const daysArray = expandDayRange(daysPart).map(
        (d) => DAY_ORDER[(DAY_ORDER.indexOf(d) + start.dayShift + 7) % 7],
      );

      schedules.push({
        days: formatDaysToSpanish(daysArray),
        hours: `${formatTime24to12(startTime)} / ${formatTime24to12(endTime)}`,
        startTime,
        endTime,
        daysArray,
      });
    }
  }

  // Usar la librería para determinar estado actual
  const now = new Date();
  const isCurrentlyOpen = oh.getState(now);

  let closingTime: string | null = null;
  let timeUntilClose: { hours: number; minutes: number } | null = null;

  if (isCurrentlyOpen) {
    const nextChange = oh.getNextChange(now);

    if (nextChange) {
      closingTime = formatTimeFromDate(nextChange);

      const diffMs = nextChange.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      timeUntilClose = {
        hours: Math.floor(diffMinutes / 60),
        minutes: diffMinutes % 60,
      };
    }
  }

  return { schedules, isCurrentlyOpen, closingTime, timeUntilClose };
}

export function formatTimeUntilClose(
  time: { hours: number; minutes: number } | null
): string {
  if (!time) return "";
  const { hours, minutes } = time;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
