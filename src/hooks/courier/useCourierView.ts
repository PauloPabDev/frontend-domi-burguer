export type CourierView = 'classic' | 'focus';

const KEY = 'courier-view';

/** Vista elegida por el domiciliario en este dispositivo; sin elección usa la clásica. */
export function getCourierView(): CourierView {
  try {
    return localStorage.getItem(KEY) === 'focus' ? 'focus' : 'classic';
  } catch {
    return 'classic';
  }
}

export function setCourierView(view: CourierView) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    // sin almacenamiento (modo privado): la elección vale solo para esta visita
  }
}
