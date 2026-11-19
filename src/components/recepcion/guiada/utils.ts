import type { OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import type { Note } from '@/types/notes';
import type { NuevaOrdenForm, StepId } from './types';

export const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;

/** Precio de las adiciones de UNA unidad de la línea (ignora los "sin ..."). */
export const additionsPrice = (item: OrderItem) =>
  item.complements
    .filter((c) => !c.minusComplement && c.price)
    .reduce((s, c) => s + (c.price ?? 0) * c.quantity, 0);

export const unitPrice = (item: OrderItem) => item.product.price + additionsPrice(item);
export const lineTotal = (item: OrderItem) => unitPrice(item) * item.quantity;
export const countUnits = (items: OrderItem[]) => items.reduce((s, i) => s + i.quantity, 0);

/** Las notas "Cuidado" (kind === 'warning') son las alertas que deben verse en todos los pasos. */
export const alertNotes = (notes: Note[]) => notes.filter((n) => n.kind === 'warning');

/** Qué le falta al pedido para poder crearse, en lenguaje del empleado. Vacío = listo. */
export function getMissing(form: NuevaOrdenForm): string[] {
  const missing: string[] = [];
  if (form.clientState !== 'found' || !form.client) missing.push('Buscar o crear el cliente');
  else if (!form.selectedLocationId) missing.push('Elegir la dirección de entrega');
  else if (!form.delivery) missing.push(form.deliveryLoading ? 'Esperar el cálculo del domicilio' : 'Calcular el domicilio');
  if (form.orderItems.length === 0) missing.push('Agregar al menos un producto');
  return missing;
}

/** Requisito para SALIR de un paso (1 cliente, 2 entrega, 3 pedido). Devuelve el mensaje o null si se puede avanzar. */
export function getStepBlocker(step: StepId, form: NuevaOrdenForm): string | null {
  if (step === 1 && (form.clientState !== 'found' || !form.client)) return 'Busca o crea el cliente para continuar';
  if (step === 2) {
    if (!form.selectedLocationId) return 'Elige la dirección de entrega';
    if (!form.delivery) return form.deliveryLoading ? 'Calculando el domicilio…' : 'No se pudo calcular el domicilio';
  }
  if (step === 3 && form.orderItems.length === 0) return 'Agrega al menos un producto';
  return null;
}

/** Se puede ir a `target` solo si todos los pasos anteriores están completos. */
export function canGoToStep(target: StepId, form: NuevaOrdenForm): boolean {
  for (let s = 1; s < target; s += 1) if (getStepBlocker(s as StepId, form)) return false;
  return true;
}
