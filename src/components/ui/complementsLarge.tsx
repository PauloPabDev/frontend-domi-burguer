import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Complement } from "@/types/products";
import { COMPLEMENTS_LAYOUT } from "@/utils/constants/layoutConstants";
import {
  CarneIcon,
  FrenchFriesIcon,
  LechugaIcon,
  LogoProps,
  PicklesIcon,
  QuesoIcon,
  SouceIcon,
  TocinetaIcon,
  TomateIcon,
} from "./icons";
import { X } from "lucide-react";

const iconMap: { [key: string]: React.FC<LogoProps> } = {
  CarneIcon,
  FrenchFriesIcon,
  LechugaIcon,
  PicklesIcon,
  QuesoIcon,
  SouceIcon,
  TocinetaIcon,
  TomateIcon,
};

interface ComplementsLargeProps {
  complements: Complement[];
  onRemove?: (complementId: number | string) => void;
  gapPx?: number;
}

export const ComplementsLarge: React.FC<ComplementsLargeProps> = ({
  complements,
  onRemove,
  gapPx = 8,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(complements.length);
  const [isStable, setIsStable] = useState(false);
  const previousCountRef = useRef(complements.length);
  const recalculationAttemptsRef = useRef(0);

  const calculateVisible = () => {
    const container = containerRef.current;
    if (!container) return;

    const chips = Array.from(container.children).filter(
      (el) => !el.classList.contains("hidden-count-badge")
    ) as HTMLElement[];

    if (chips.length === 0) {
      return;
    }

    let lineCount = 1;
    let lastTop = Math.round(chips[0].offsetTop);
    let countInTwoLines = chips.length;

    for (let i = 1; i < chips.length; i++) {
      const currentTop = Math.round(chips[i].offsetTop);

      if (Math.abs(currentTop - lastTop) > COMPLEMENTS_LAYOUT.POSITION_TOLERANCE_PX) {
        lineCount++;
        lastTop = currentTop;

        if (lineCount > COMPLEMENTS_LAYOUT.MAX_LINES) {
          countInTwoLines = i;
          break;
        }
      }
    }

    if (countInTwoLines !== previousCountRef.current && !isStable) {
      previousCountRef.current = countInTwoLines;
      setVisibleCount(countInTwoLines);
      recalculationAttemptsRef.current++;

      if (recalculationAttemptsRef.current >= COMPLEMENTS_LAYOUT.MAX_RECALCULATION_ATTEMPTS) {
        setTimeout(() => setIsStable(true), COMPLEMENTS_LAYOUT.STABILITY_DELAY_MS);
      }
    } else if (!isStable && recalculationAttemptsRef.current > 0) {
      setTimeout(() => setIsStable(true), COMPLEMENTS_LAYOUT.STABILITY_DELAY_MS);
    }
  };

  // Reset cuando cambian los complementos
  useEffect(() => {
    setVisibleCount(complements.length);
    previousCountRef.current = complements.length;
    setIsStable(false);
    recalculationAttemptsRef.current = 0;
  }, [complements.length]);

  // Calcular después del render
  useLayoutEffect(() => {
    if (!isStable) {
      const timeoutId = setTimeout(() => {
        calculateVisible();
      }, COMPLEMENTS_LAYOUT.CALCULATION_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, isStable]);

  // Recalcular en resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      console.log('Resize detectado');
      setIsStable(false);
      recalculationAttemptsRef.current = 0;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculateVisible();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!complements || complements.length === 0) return null;

  const hiddenCount = complements.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-start justify-center w-full relative"
      style={{
        gap: `${gapPx}px`,
        maxHeight: "calc(28px * 2 + 8px)",
        overflow: "hidden",
      }}
    >
      {complements.slice(0, visibleCount).map((comp, idx) => {
        const IconComponent = comp.icon ? iconMap[comp.icon] : null;

        return (
          <div
            key={`${comp.id}-${idx}`}
            className="inline-flex h-7 items-center justify-center gap-2 px-3 py-1 rounded-[30px] border border-solid border-[#808080] bg-accent-yellow-10 flex-shrink-0"
          >
            {IconComponent && <IconComponent className="w-4 h-4" />}
            <span className="text-neutrosblack-80 font-normal text-[12px] sm:text-[14px] leading-[18px] whitespace-nowrap font-[Montserrat,Helvetica]">
              <span className="text-[#313131]">
                {comp.minusComplement === true || comp.minusId
                  ? "0"
                  : comp.quantity}{" "}
                {comp.name}
              </span>
              {comp.price != 0 && comp.price !== null && (
                <span className="text-[#808080]"> (+${comp.price})</span>
              )}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(comp.id)}
                className="ml-1 flex items-center justify-center w-4 h-4 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        );
      })}

      {hiddenCount > 0 && (
        <div
          className="hidden-count-badge inline-flex items-center justify-center px-2 py-1 h-7 text-[13px] leading-[1] rounded-[30px] border border-[#808080] text-[#313131] bg-accent-yellow-10 flex-shrink-0"
          title={complements
            .slice(visibleCount)
            .map((c) => `${c.quantity} ${c.name}`)
            .join(", ")}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};