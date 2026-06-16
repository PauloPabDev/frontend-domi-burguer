type TrackData = Record<string, string | number | boolean>;

export function track(event: string, data?: TrackData): void {
  if (typeof window !== 'undefined' && (window as Window & { umami?: { track: (e: string, d?: TrackData) => void } }).umami) {
    (window as Window & { umami?: { track: (e: string, d?: TrackData) => void } }).umami!.track(event, data);
  }
}
