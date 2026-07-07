"use client";

import { useState, useCallback, useRef } from 'react';
import { Complement } from '@/types/products';
import {
  handleAddableComplement,
  handleSpecialComplement,
  handleRemovableComplement,
} from '@/hooks/home/useMenu';

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
    const newQuantity = action === 'plus' ? ingredient.quantity + 1 : ingredient.quantity - 1;
    const current = pendingRef.current;

    let result: { complementsToAdd: Complement[]; complementsToRemove: (number | string)[] };

    if (ingredient.type === 'special') {
      result = handleSpecialComplement(ingredient, action, current, newQuantity);
    } else if (ingredient.type === 'addable') {
      result = handleAddableComplement(ingredient, action, current, 0, newQuantity);
    } else {
      result = handleRemovableComplement(ingredient, action, current, newQuantity);
    }

    let updated = [...current];

    result.complementsToAdd.forEach((comp) => {
      const existing = updated.find((c) => c.id === comp.id);
      if (existing) {
        updated = updated.map((c) => c.id === comp.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        updated.push(comp);
      }
    });

    result.complementsToRemove.forEach((id) => {
      updated = updated.filter((c) => c.id !== id);
    });

    // handleAddableComplement/handleSpecialComplement return empty arrays when the entry
    // already exists above its threshold — update directly so the modal display stays in sync.
    if (
      (ingredient.type === 'addable' || ingredient.type === 'special') &&
      result.complementsToAdd.length === 0 &&
      result.complementsToRemove.length === 0
    ) {
      const targetId = ingredient.additionId ?? ingredient.id;
      const entry = updated.find((c) => c.id === targetId);
      if (entry) {
        updated = action === 'plus'
          ? updated.map((c) => c.id === targetId ? { ...c, quantity: c.quantity + 1 } : c)
          : updated
              .map((c) => c.id === targetId ? { ...c, quantity: Math.max(0, c.quantity - 1) } : c)
              .filter((c) => c.id !== targetId || c.quantity > 0);
      }
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
