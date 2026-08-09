"use client";

import { useState, useCallback, useRef } from 'react';
import { Complement } from '@/types/products';

// Editor de complementos para recepción. A diferencia del flujo del cliente
// (ver useMenu.ts), aquí cada complemento viene de la API y se agrega/retira
// como un extra plano con cantidad — sin roles (addable/special/removable)
// ni relaciones additionId/minusId.
export function useComplementEditor(
  confirmComplements: (complements: Complement[]) => void
) {
  const pendingRef = useRef<Complement[]>([]);
  const originalRef = useRef<Complement[]>([]);
  const [pendingComplements, setPendingComplements] = useState<Complement[]>([]);

  const initEditor = useCallback((initial: Complement[]) => {
    const copy = [...initial];
    pendingRef.current = copy;
    originalRef.current = copy;
    setPendingComplements(copy);
  }, []);

  const handleChange = useCallback((ingredient: Complement, action: 'plus' | 'minus') => {
    const current = pendingRef.current;
    const existing = current.find((c) => c.id === ingredient.id);
    const newQuantity = (existing?.quantity ?? 0) + (action === 'plus' ? 1 : -1);

    let updated: Complement[];
    if (newQuantity <= 0) {
      updated = current.filter((c) => c.id !== ingredient.id);
    } else if (existing) {
      updated = current.map((c) => (c.id === ingredient.id ? { ...c, quantity: newQuantity } : c));
    } else {
      updated = [...current, { ...ingredient, quantity: newQuantity, minusComplement: false }];
    }

    pendingRef.current = updated;
    setPendingComplements(updated);
  }, []);

  const handleConfirm = useCallback(() => {
    confirmComplements(pendingRef.current);
  }, [confirmComplements]);

  const handleCancel = useCallback(() => {
    confirmComplements(originalRef.current);
  }, [confirmComplements]);

  return { pendingComplements, initEditor, handleChange, handleConfirm, handleCancel };
}
