'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/utils/analytics';

export function useTrackSectionView(sectionName: string, threshold = 0.4): React.RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          hasTracked.current = true;
          track('section_viewed', { section: sectionName });
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName, threshold]);

  return ref as React.RefObject<HTMLElement>;
}
