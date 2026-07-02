import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Complement } from '@/types/products';

const ANNIVERSARY_PROMO_ID = 'ogGhB3dnaysYUm6d9z2R';

const ANNIVERSARY_COMPLEMENT: Complement = {
  id: ANNIVERSARY_PROMO_ID,
  name: 'Papas gratis',
  quantity: 1,
  price: 0,
  type: 'addable',
  minusComplement: false,
  icon: 'FrenchFriesIcon',
};

export const useAnniversaryPromo = () => {
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    if (items.length === 0) return;

    const alreadyApplied = items.some((item) =>
      item.complements.some((c) => c.id === ANNIVERSARY_PROMO_ID)
    );

    if (alreadyApplied) return;

    const firstItem = items[0];
    const updatedComplements = [...firstItem.complements, ANNIVERSARY_COMPLEMENT];
    useCartStore.getState().updateItemComplements(firstItem.id, updatedComplements);
  }, [items]);
};
