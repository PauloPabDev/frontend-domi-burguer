type TrackData = Record<string, string | number | boolean>;

export function track(event: string, data?: TrackData): void {
  if (typeof window !== 'undefined' && (window as Window & { umami?: { track: (e: string, d?: TrackData) => void } }).umami) {
    (window as Window & { umami?: { track: (e: string, d?: TrackData) => void } }).umami!.track(event, data);
  }
}

/** Eventos unificados de los avisos flotantes (cookies, signin, install) para medirlos igual. */
export function trackPrompt(prompt: string, action: 'shown' | 'accepted' | 'dismissed', via?: string): void {
  track(`prompt_${action}`, via ? { prompt, via } : { prompt });
}
