# Guía de Promociones Automáticas del Carrito

Cómo agregar y retirar promociones que se aplican automáticamente cuando el cliente tiene ciertos productos en el carrito o en el formulario de recepción.

---

## Cómo funciona el sistema

La misma lógica corre en **dos superficies** independientes:

| Superficie | Archivo clave | Estado |
|---|---|---|
| Carrito web (clientes) | `src/hooks/cart/useAnniversaryPromotion.ts` | Zustand (`useCartStore`) |
| Formulario de recepción (staff) | `src/hooks/recepcion/useNuevaOrden.ts` | React state (`orderItems`) |

En ambos casos el patrón es:

1. Observar los ítems con `useEffect`.
2. Si hay productos elegibles → agregar el complemento gratis al primero de ellos.
3. Si se retiran los productos elegibles → eliminar el complemento automáticamente.
4. Usar un `rewardCode` único por promoción para no duplicar ni confundir promociones entre sí.

Las constantes compartidas (`ANNIVERSARY_REWARD_CODE`, `ANNIVERSARY_COMPLEMENT_ID`, etc.) viven en `src/hooks/cart/useAnniversaryPromotion.ts` y se importan desde recepción.

Los banners informativos se muestran en:
- `src/components/cart/CartSummary.tsx` (carrito web)
- `src/components/recepcion/NuevaOrdenForm.tsx` (formulario staff)

---

## Agregar una nueva promoción

### Paso 1 — Crear el hook

Crea el archivo `src/hooks/cart/use<NombrePromo>Promotion.ts` copiando la estructura de `useAnniversaryPromotion.ts` y ajustando las siguientes constantes:

```ts
// Código único que identifica esta promoción (no usar espacios ni tildes)
export const MI_PROMO_REWARD_CODE = 'PROMO-NOMBRE';

// ID del complemento en Firebase (el documento de la colección de adiciones)
const PROMO_COMPLEMENT_ID = 'xxxxxxxxxxxxxxxxxxxxxx';

// Nombre que verá el cliente en los chips de complementos
const PROMO_COMPLEMENT_NAME = 'Nombre del regalo';

// IDs numéricos de los productos que activan la promoción (ver src/data/products.ts)
// 1 = COMBO  |  2 = HAMBURGUESA ARTESANAL  |  38 = SALSA DE AJO  |  39 = PAPAS VAQUERA  |  40 = PAPAS TROYANA  |  43 = CHEESECAKE  |  44 = JUGO DE MORA
const ELIGIBLE_PRODUCT_IDS = [1, 2];
```

El resto del hook (la lógica de agregar/retirar) no necesita cambios.

> Si la promoción no depende de ningún producto específico sino que aplica a todos los pedidos, cambia la condición `eligibleItems` por `currentItems.length > 0`.

---

### Paso 2 — Registrar el hook en CartSummary

Abre `src/components/cart/CartSummary.tsx` y haz tres cambios:

**a) Importar el hook y su constante:**
```tsx
import { useMiPromoPromotion, MI_PROMO_REWARD_CODE } from "@/hooks/cart/useMiPromoPromotion";
```

**b) Llamar el hook junto a los demás (línea ~57):**
```tsx
const { isPromoActive: isMiPromoActive } = useMiPromoPromotion();
```

**c) Agregar el bloque de protección del complemento en `onRemoveComplement`:**

Busca la función que ya existe para el aniversario y agrégale la nueva condición:
```tsx
onRemoveComplement={(itemId, complementId) => {
  const cartItem = items.find((i) => i.id === itemId);
  const comp = cartItem?.complements.find((c) => c.id === complementId);
  if (comp?.rewardCode === ANNIVERSARY_REWARD_CODE) return;
  if (comp?.rewardCode === MI_PROMO_REWARD_CODE) return;  // <-- nueva línea
  removeComplement(itemId, complementId);
}}
```

---

### Paso 3 — Agregar el banner

Dentro del mismo `CartSummary.tsx`, agrega el banner debajo del existente (o en lugar de él si el anterior ya fue retirado):

```tsx
{isMiPromoActive && (
  <div className="w-full flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3">
    <span className="text-2xl leading-none mt-0.5">🎁</span>
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-bold text-yellow-800 leading-snug">
        Título de la promoción
      </p>
      <p className="text-xs text-yellow-700 leading-snug">
        Descripción breve del regalo y por qué lo reciben.
      </p>
    </div>
  </div>
)}
```

---

## Retirar una promoción

Cuando termina la campaña, sigue estos pasos para no dejar código muerto:

### Paso 1 — Quitar el hook de CartSummary

En `src/components/cart/CartSummary.tsx`:

1. Elimina el `import` del hook y su constante.
2. Elimina la línea `const { isPromoActive } = useNombrePromotion();`.
3. Elimina el bloque `{isPromoActive && ( ... )}` del banner.
4. Elimina la línea `if (comp?.rewardCode === NOMBRE_REWARD_CODE) return;` del `onRemoveComplement`.

### Paso 2 — Eliminar el archivo del hook

Borra el archivo `src/hooks/cart/useNombrePromotion.ts`.

### Paso 3 — Verificar que no queden complementos huérfanos

Los complementos se guardan en `localStorage` bajo la clave `cart-storage-v1`. Si hay clientes con el carrito guardado, el complemento de la promo seguirá visible hasta que vacíen el carrito o compren.

No es un problema funcional (el precio es 0 y no afecta el pedido), pero si quieres forzar la limpieza puedes cambiar la clave de persistencia en `src/store/cartStore.ts`:

```ts
// Cambiar de:
name: "cart-storage-v1",
// A:
name: "cart-storage-v2",
```

Esto invalida todos los carritos guardados y los clientes empiezan desde cero.

---

## Referencia rápida

| Archivo | Rol |
|---|---|
| `src/hooks/cart/useAnniversaryPromotion.ts` | Ejemplo de promoción implementada (10° Aniversario) |
| `src/components/cart/CartSummary.tsx` | Donde se registran los hooks y se muestran los banners |
| `src/data/products.ts` | IDs numéricos de los productos disponibles |
| `src/store/cartStore.ts` | Store de Zustand — clave `cart-storage-v1` en localStorage |

---

## Checklist para activar una promo

- [ ] Hook creado con constantes correctas (`rewardCode`, `complementId`, `productIds`)
- [ ] Hook importado y llamado en `CartSummary.tsx`
- [ ] Banner agregado con mensaje claro para el cliente
- [ ] Complemento protegido del `onRemoveComplement`
- [ ] Build sin errores: `npx tsc --noEmit`

## Checklist para retirar una promo

- [ ] Import eliminado de `CartSummary.tsx`
- [ ] Hook call eliminado de `CartSummary.tsx`
- [ ] Banner eliminado de `CartSummary.tsx`
- [ ] Guarda en `onRemoveComplement` eliminada de `CartSummary.tsx`
- [ ] Archivo del hook eliminado
- [ ] Build sin errores: `npx tsc --noEmit`
- [ ] (Opcional) Clave de `cart-storage` incrementada si se quiere limpiar carritos guardados
