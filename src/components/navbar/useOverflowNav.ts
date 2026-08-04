import { useLayoutEffect, useRef, useState } from 'react';

interface UseOverflowNavOptions {
  /** Cantidad total de ítems candidatos a mostrarse en línea. */
  itemCount: number;
  /** Separación (px) entre ítems y entre el último ítem y el disparador "más". */
  gap?: number;
}

/**
 * Calcula cuántos ítems de una lista caben en línea dentro del espacio
 * disponible, sin recurrir a un breakpoint fijo. Los que no caben deben
 * pasar a un dropdown ("más") en vez de colapsar visualmente.
 *
 * Uso: además de los nodos visibles, se debe renderizar una fila "espejo"
 * (invisible, fuera de flujo) con TODOS los ítems usando `measureRef`, para
 * medir su ancho real sin afectar el layout. `moreRef` mide el disparador
 * "más" (reservando su espacio) y `containerRef` mide el espacio disponible.
 */
export function useOverflowNav({ itemCount, gap = 8 }: UseOverflowNavOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const recompute = () => {
      const containerWidth = container.clientWidth;
      const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);
      const moreWidth = moreRef.current?.offsetWidth ?? 0;

      const totalAll = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(widths.length - 1, 0);
      if (totalAll <= containerWidth) {
        setVisibleCount(widths.length);
        return;
      }

      let used = moreWidth;
      let count = 0;
      for (const w of widths) {
        const next = used + gap + w;
        if (next > containerWidth) break;
        used = next;
        count++;
      }
      setVisibleCount(count);
    };

    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    ro.observe(measure);
    return () => ro.disconnect();
  }, [itemCount, gap]);

  return { containerRef, measureRef, moreRef, visibleCount };
}
