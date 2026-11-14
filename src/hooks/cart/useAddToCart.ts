import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/products";
import { generateCartItemId, calculateTotalPrice } from "@/lib/utils";
import { track } from "@/utils/analytics";

export const useAddToCart = () => {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product) => {
    // Producto agotado: no se puede agregar al carrito
    if (product.soldOut) return;

    // Calcular precio total con complementos
    const totalPrice = calculateTotalPrice(product.basePrice, product.complements);

    // Una línea independiente por unidad (copias con las mismas adiciones)
    for (let i = 0; i < product.quantity; i++) {
      addItem({
        id: generateCartItemId(product.id),
        productId: product.id,
        name: product.name,
        price: totalPrice,
        basePrice: product.basePrice,
        quantity: 1,
        image1: product.image1,
        image2: product.image2 || null,
        complements: product.complements.map((c) => ({ ...c })),
        allowCustomization: product.allowCustomization,
        customizationType: product.customizationType,
      });
    }
    track('product_added_to_cart', {
      product_name: product.name,
      product_id: product.id,
      quantity: product.quantity,
      price: totalPrice,
      complements_count: product.complements.length,
    });

  };

  return { handleAddToCart };
};