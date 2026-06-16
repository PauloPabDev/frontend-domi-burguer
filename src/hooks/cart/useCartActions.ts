import { useCallback, useEffect } from 'react';
import { track } from '@/utils/analytics';
import { useCartStore } from '@/store/cartStore';
import { useCartModalItemDeleteStore } from '@/store/cartModalItemDeleteStore';
import { useAppliedCodeStore } from '@/store/appliedCodeStore';
import { useCheckoutFormStore } from '@/store/checkoutFormStore';
import { Code } from '@/types/codes';
import { Complement } from '@/types/products';
import { PRODUCTS } from '@/data/products';
import { generateCartItemId, calculateTotalPrice } from '@/lib/utils';

const getFreeProductItemId = (rewardCode: string) =>
  `free-product-reward-${rewardCode}`;

export const useCartActions = () => {
  const {
    items,
    updateQuantity,
    removeComplement,
    addItem,
  } = useCartStore();

  const {
    itemToDelete,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
  } = useCartModalItemDeleteStore();

  const { appliedCode } = useAppliedCodeStore();

  const isProductAllowedForCode = useCallback((code: Code, productId: number) => {
    if (!code.productIds || code.productIds.length === 0) return true;
    return code.productIds.some((allowedProductId) => String(allowedProductId) === String(productId));
  }, []);

  const getEligibleItemsForCode = useCallback((code: Code) => {
    const currentItems = useCartStore.getState().items;
    return currentItems.filter((item) => isProductAllowedForCode(code, item.productId));
  }, [isProductAllowedForCode]);

  const getReferralProductRestrictionMessage = useCallback(() => {
    return 'Este código de referido solo aplica a productos seleccionados. Agrega uno de los productos permitidos para usarlo.';
  }, []);

  const clearInvalidReferralCode = useCallback((code: Code) => {
    const currentItems = useCartStore.getState().items;

    for (const item of currentItems) {
      const hasReferralComplement = item.complements.some(
        (complement) => complement.rewardCode === code.code
      );

      if (!hasReferralComplement) continue;

      const updatedComplements = item.complements.filter(
        (complement) => complement.rewardCode !== code.code
      );

      useCartStore.getState().updateItemComplements(item.id, updatedComplements);
    }

    useAppliedCodeStore.getState().removeAppliedCode();
    useCheckoutFormStore.getState().setError(getReferralProductRestrictionMessage());
  }, [getReferralProductRestrictionMessage]);

  // ─── Lógica para reward tipo complement (referral) ───────────────────────────

  const addComplementReward = useCallback((appliedCoupon: Code) => {
    const rewardElement = appliedCoupon.reward?.elements[0];
    if (!rewardElement) return;

    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      useAppliedCodeStore.getState().setRewardApplied(false);
      return;
    }

    const eligibleItems = getEligibleItemsForCode(appliedCoupon);

    if (eligibleItems.length === 0) {
      clearInvalidReferralCode(appliedCoupon);
      return;
    }

    // Verificar si ya existe el complemento en algún item
    const alreadyHasComplement = eligibleItems.some((item) =>
      item.complements.some((c) => c.rewardCode === appliedCoupon.code)
    );

    if (alreadyHasComplement) {
      useAppliedCodeStore.getState().setRewardApplied(true);
      return;
    }

    const firstItem = eligibleItems[0];

    const newComplement: Complement = {
      id: rewardElement.id,
      name: rewardElement.note || `Complemento gratis (${appliedCoupon.code})`,
      quantity: rewardElement.quantity || 1,
      price: rewardElement.price,
      type: 'special',
      minusComplement: false,
      rewardCode: appliedCoupon.code,
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

    useAppliedCodeStore.getState().setRewardApplied(true);
  }, [clearInvalidReferralCode, getEligibleItemsForCode]);

  const removeComplementReward = useCallback((appliedCoupon: Code) => {
    const currentItems = useCartStore.getState().items;

    for (const item of currentItems) {
      const hasReferralComplement = item.complements.some(
        (c) => c.rewardCode === appliedCoupon.code
      );

      if (hasReferralComplement) {
        const updatedComplements = item.complements.filter(
          (c) => c.rewardCode !== appliedCoupon.code
        );
        useCartStore.getState().updateItemComplements(item.id, updatedComplements);
        break;
      }
    }

    useAppliedCodeStore.getState().setRewardApplied(false);
  }, []);

  // ─── Lógica para reward tipo product (freeElement / claim_of_prizes) ─────────

  const addFreeProductReward = useCallback((appliedCoupon: Code) => {
    const rewardElement = appliedCoupon.reward?.elements[0];
    if (!rewardElement) return;

    const currentItems = useCartStore.getState().items;
    const freeItemId = getFreeProductItemId(appliedCoupon.code);

    // Ya existe en el carrito — no duplicar
    if (currentItems.some((item) => item.id === freeItemId)) {
      useAppliedCodeStore.getState().setRewardApplied(true);
      return;
    }

    // Buscar el producto real en el catálogo por el id del reward element
    const catalogProduct = PRODUCTS.find(
      (p) => String(p.id) === String(rewardElement.id)
    );

    const freeItem = {
      id: freeItemId,
      productId: catalogProduct?.id ?? Number(rewardElement.id),
      name: catalogProduct ? `${catalogProduct.name} (Premio)` : `Premio gratis (${appliedCoupon.code})`,
      price: rewardElement.price ?? 0,
      basePrice: rewardElement.price ?? 0,
      quantity: rewardElement.quantity ?? 1,
      image1: catalogProduct?.image1 ?? '',
      image2: catalogProduct?.image2 ?? null,
      complements: [],
      allowCustomization: catalogProduct?.allowCustomization ?? false,
      customizationType: catalogProduct?.customizationType ?? 'none',
      rewardCode: appliedCoupon.code,
    };

    useCartStore.getState().addItem(freeItem);
    useAppliedCodeStore.getState().setRewardApplied(true);
  }, []);

  const removeFreeProductReward = useCallback((appliedCoupon: Code) => {
    const freeItemId = getFreeProductItemId(appliedCoupon.code);
    useCartStore.getState().removeItem(freeItemId);
    useAppliedCodeStore.getState().setRewardApplied(false);
  }, []);

  // ─── Funciones públicas ───────────────────────────────────────────────────────

  const addCodeInItems = useCallback((appliedCoupon: Code) => {
    const { reward } = appliedCoupon;
    if (!reward) return;

    if (reward.typeAddReward === 'complement') {
      // Solo referral usa complement por ahora
      addComplementReward(appliedCoupon);
    } else if (reward.typeAddReward === 'product') {
      // claim_of_prizes y cualquier futuro tipo que agregue un producto gratis
      addFreeProductReward(appliedCoupon);
    }
  }, [addComplementReward, addFreeProductReward]);

  const removeCodeFromItems = useCallback((appliedCoupon: Code) => {
    const { reward } = appliedCoupon;
    if (!reward) return;

    if (reward.typeAddReward === 'complement') {
      removeComplementReward(appliedCoupon);
    } else if (reward.typeAddReward === 'product') {
      removeFreeProductReward(appliedCoupon);
    }
  }, [removeComplementReward, removeFreeProductReward]);

  const checkAndReapplyReward = useCallback(() => {
    const { appliedCode: code } = useAppliedCodeStore.getState();
    if (!code?.reward) return;

    // Solo se re-aplica automáticamente para rewards de tipo complement (referido).
    // Los rewards de tipo product (claim_of_prizes) los elimina el usuario intencionalmente.
    if (code.reward.typeAddReward !== 'complement') return;

    const currentItems = useCartStore.getState().items;

    if (currentItems.length === 0) {
      useAppliedCodeStore.getState().setRewardApplied(false);
      return;
    }

    const rewardStillExists = currentItems.some((item) =>
      isProductAllowedForCode(code, item.productId) &&
      item.complements.some((c) => c.rewardCode === code.code)
    );

    if (!rewardStillExists) {
      addComplementReward(code);
    }
  }, [addComplementReward, isProductAllowedForCode]);

  // ─── Handlers del carrito ─────────────────────────────────────────────────────

  const handleIncrease = (id: string, quantity: number) => {
    updateQuantity(id, quantity + 1);
    track('cart_item_quantity_increased', { item_id: id, new_quantity: quantity + 1 });
  };

  const handleDecrease = (id: string, quantity: number) => {
    if (quantity === 1) {
      const item = items.find((item) => item.id === id);
      if (item) {
        openDeleteModal({ id: item.id, name: item.name });
      }
    } else {
      updateQuantity(id, quantity - 1);
      track('cart_item_quantity_decreased', { item_id: id, new_quantity: quantity - 1 });
    }
  };

  const handleRemoveReward = useCallback((id: string, name: string, rewardCode: string) => {
    openDeleteModal({ id, name, rewardCode });
  }, [openDeleteModal]);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.rewardCode) {
      useAppliedCodeStore.getState().removeAppliedCode();
    }
    track('cart_item_deleted', {
      item_id: itemToDelete.id,
      item_name: itemToDelete.name,
      was_reward: !!itemToDelete.rewardCode,
    });
    updateQuantity(itemToDelete.id, 0);
    closeDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    closeDeleteModal();
  };

  // ─── Efecto: re-aplicar reward de complement si se pierde al modificar el carrito ───

  useEffect(() => {
    if (!appliedCode?.reward || appliedCode.reward.typeAddReward !== 'complement') return;

    const timeoutId = setTimeout(() => {
      const currentItems = useCartStore.getState().items;

      if (currentItems.length === 0) {
        useAppliedCodeStore.getState().setRewardApplied(false);
        return;
      }

      const rewardExists = currentItems.some((item) =>
        isProductAllowedForCode(appliedCode, item.productId) &&
        item.complements.some((c) => c.rewardCode === appliedCode.code)
      );

      if (!rewardExists) {
        addComplementReward(appliedCode);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [items, appliedCode, addComplementReward, isProductAllowedForCode]);

  return {
    items,
    handleIncrease,
    handleDecrease,
    handleRemoveReward,
    handleConfirmDelete,
    handleCloseDeleteModal,
    removeComplement,
    addItem,
    itemToDelete,
    isDeleteModalOpen,
    addCodeInItems,
    removeCodeFromItems,
    checkAndReapplyReward,
  };
};
