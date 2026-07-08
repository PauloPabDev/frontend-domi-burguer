import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { generateCartItemId, calculateTotalPrice } from '@/lib/utils';
import { Complement } from '@/types/products';

export const ANNIVERSARY_REWARD_CODE = 'ANIVERSARIO-10';
const ANNIVERSARY_COMPLEMENT_ID = 'T2RTWuDgHWjIy3Vb2BjW';
const ANNIVERSARY_COMPLEMENT_NAME = 'Cheesecake de Fresa';
// Aplica a COMBO (1) y HAMBURGUESA ARTESANAL (2)
const ELIGIBLE_PRODUCT_IDS = [1, 2];

export const useAnniversaryPromotion = () => {
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    const currentItems = useCartStore.getState().items;

    const eligibleItems = currentItems.filter((item) =>
      ELIGIBLE_PRODUCT_IDS.includes(item.productId)
    );

    const itemWithPromo = currentItems.find((item) =>
      item.complements.some((c) => c.rewardCode === ANNIVERSARY_REWARD_CODE)
    );

    if (eligibleItems.length === 0) {
      // Sin productos elegibles — quitar el complemento si existe
      if (itemWithPromo) {
        const updatedComplements = itemWithPromo.complements.filter(
          (c) => c.rewardCode !== ANNIVERSARY_REWARD_CODE
        );
        useCartStore.getState().updateItemComplements(itemWithPromo.id, updatedComplements);
      }
      return;
    }

    // Ya tiene el complemento de aniversario — no duplicar
    if (itemWithPromo) return;

    const firstItem = eligibleItems[0];

    const newComplement: Complement = {
      id: ANNIVERSARY_COMPLEMENT_ID,
      name: ANNIVERSARY_COMPLEMENT_NAME,
      quantity: 1,
      price: 0,
      type: 'special',
      minusComplement: false,
      rewardCode: ANNIVERSARY_REWARD_CODE,
    };

    if (firstItem.quantity > 1) {
      useCartStore.getState().updateQuantity(firstItem.id, firstItem.quantity - 1);

      const newComplements = [...firstItem.complements, newComplement];
      const newItemId = generateCartItemId(firstItem.productId, newComplements);
      const newPrice = calculateTotalPrice(firstItem.basePrice, newComplements);

      useCartStore.getState().addItem({
        ...firstItem,
        id: newItemId,
        quantity: 1,
        complements: newComplements,
        price: newPrice,
      });
    } else {
      const updatedComplements = [...firstItem.complements, newComplement];
      useCartStore.getState().updateItemComplements(firstItem.id, updatedComplements);
    }
  }, [items]);

  const isPromoActive = items.some((item) =>
    ELIGIBLE_PRODUCT_IDS.includes(item.productId)
  );

  return { isPromoActive };
};
