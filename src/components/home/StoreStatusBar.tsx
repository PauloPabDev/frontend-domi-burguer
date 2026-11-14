"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKitchensStatus } from "@/hooks/kitchen/useKitchensStatus";
import { getKitchenStatusLabel, TONE_STYLES } from "@/utils/kitchenStatusLabel";
import { parseOpeningHours } from "@/utils/openingHoursParser";
import { KitchenHoursCard } from "@/components/kitchen/KitchenHoursCard";

/** Estado y horario de cada cocina (se muestra en /horarios): «Cerrado · abrimos hoy a las 4:30 PM», «Cerramos en 8 min». */
export function StoreStatusBar() {
  const { statuses, nowMs } = useKitchensStatus();
  const [showHours, setShowHours] = useState(false);

  const parsedHours = useMemo(
    () => statuses.map((s) => ({ id: s.id, name: s.name, hours: parseOpeningHours(s.openingHours) })),
    [statuses],
  );

  if (statuses.length === 0) return null;

  const showName = statuses.length > 1;

  return (
    <section aria-label="Estado de las cocinas" className="w-full flex flex-col items-center gap-2 mb-8">
      <div className="flex flex-wrap justify-center gap-2" role="status" aria-live="polite">
        {statuses.map((s) => {
          const { text, tone } = getKitchenStatusLabel(s, nowMs);
          return (
            <span
              key={s.id}
              className={cn("rounded-full px-4 py-1.5 text-sm font-medium body-font", TONE_STYLES[tone])}
            >
              {showName && <span className="font-bold">{s.name} · </span>}
              {text}
            </span>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowHours((v) => !v)}
        aria-expanded={showHours}
        className="flex items-center gap-1 text-xs font-semibold text-neutral-black-60 hover:text-primary-red transition-colors"
      >
        {showHours ? "Ocultar horarios" : "Ver horarios"}
        <ChevronDown size={14} className={cn("transition-transform", showHours && "rotate-180")} />
      </button>

      {showHours && (
        <div className="w-full max-w-md flex flex-col gap-3">
          {parsedHours.map((k) => (
            <div key={k.id} className="flex flex-col gap-1">
              {showName && <p className="px-1 text-sm font-bold">{k.name}</p>}
              <KitchenHoursCard parsedHours={k.hours} showHours />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
