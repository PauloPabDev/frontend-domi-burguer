import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/products";
import { generateCartItemId, calculateTotalPrice } from "@/lib/utils";
import { track } from "@/utils/analytics";

export const useAddToCart = () => {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product) => {
    // Generar ID único basado en producto y complementos
    const uniqueId = generateCartItemId(product.id, product.complements);
    
    // Calcular precio total con complementos
    const totalPrice = calculateTotalPrice(product.basePrice, product.complements);
    
    
    // Crear item del carrito
    const cartItem = {
      id: uniqueId,
      productId: product.id,
      name: product.name,
      price: totalPrice,
      basePrice: product.basePrice,
      quantity: product.quantity,
      image1: product.image1,
      image2: product.image2 || null,
      complements: product.complements,
      allowCustomization: product.allowCustomization,
      customizationType: product.customizationType,
    };
    
    addItem(cartItem);
    track('product_added_to_cart', {
      product_name: product.name,
      product_id: product.id,
      quantity: product.quantity,
      price: totalPrice,
      complements_count: product.complements.length,
    });

    console.log('✅ Producto añadido al carrito:', {
      id: uniqueId,
      productName: product.name,
      quantity: product.quantity,
      complementsCount: product.complements.length,
      basePrice: product.basePrice,
      totalPrice,
      pricePerUnit: totalPrice,
      totalCost: totalPrice * product.quantity,
    });
  };

  return { handleAddToCart };
};