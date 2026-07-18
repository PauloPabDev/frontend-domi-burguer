"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpikesIcon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import Tooltip from "@/components/ui/tooltip";
import { useCartActions } from "@/hooks/cart/useCartActions";
import { useCartSubmit } from "@/hooks/cart/useCartSubmit";
import { useComplementsModal } from "@/hooks/cart/useComplementsModal";
import { useCoupon } from "@/hooks/cart/useCoupon";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CouponInput } from "@/components/cart/CouponInput";
import { OrderTotals } from "@/components/cart/OrderTotals";
import { ErrorCard } from "@/components/cart/ErrorCard";
import { useCheckoutFormStore } from "@/store/checkoutFormStore";
import { ProductGridModal } from "@/components/cart/ProductGridModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { track } from "@/utils/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const CartSummary = ({ }) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setPendingPromoCode(localStorage.getItem("pendingReferralCode"));
  }, []);

  // Context & Store
  const { getSubtotal, getTotal, getDeliveryFee, removeComplement } =
    useCartStore();
  const {
    items,
    handleDecrease,
    handleIncrease,
    handleRemoveReward,
    addCodeInItems,
    removeCodeFromItems,
  } = useCartActions();

  const { handleEditComplements } = useComplementsModal();
  const { isSubmitting, error } = useCartSubmit();
  const { setError } = useCheckoutFormStore();

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isLoading: isCouponLoading,
    error: couponError,
    requiresLogin: couponRequiresLogin,
    clearRequiresLogin: clearCouponRequiresLogin,
    applyCoupon,
    removeCoupon,
  } = useCoupon();

  // El hook useCartActions ahora maneja automáticamente la aplicación y re-aplicación
  // del reward del código cuando hay cambios en los items del carrito.
  // Solo necesitamos aplicar el código cuando se valida por primera vez.
  useEffect(() => {
    if (appliedCoupon) {
      console.log("Código aplicado:", appliedCoupon.code);
      addCodeInItems(appliedCoupon);
    }
  }, [addCodeInItems, appliedCoupon]);

  return (
    <div className="flex flex-col gap-8 max-w-[500px] justify-center w-full h-full">
      <Card className="flex-col shadow-none bg-transparent! rounded-2xl flex h-full w-full border-0">
        <SpikesIcon className="w-full" />
        <CardContent className="p-0 w-full">
          <div className="px-4 xl:px-6 py-2 bg-accent-yellow-10 flex flex-col items-start gap-8 w-full">
            <div className="inline-flex flex-col gap-4 items-start w-full">
              <h2 className="mt-[-1.00px]">RESUMEN DEL PEDIDO</h2>

              <div className="w-full h-8 gap-4 flex items-center">
                <p className="body-font font-bold flex-1">
                  Programar el envío de mi pedido
                </p>
                <Tooltip text="Próximamente">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    rightIcon={<CalendarIcon className="w-[15px] h-[15px]" />}
                    disabled={true}
                    className="bg-accent-yellow-10 h-auto"
                  >
                    PROGRAMAR
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="flex flex-col items-start gap-8 w-full">
              <div className="flex flex-col items-start gap-4 w-full">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onEditComplements={handleEditComplements}
                    onRemoveComplement={(itemId, complementId) => {
                      removeComplement(itemId, complementId);
                    }}
                    onDecrease={handleDecrease}
                    onIncrease={handleIncrease}
                    onRemoveReward={handleRemoveReward}
                  />
                ))}

                {items.length === 0 && (
                  <>
                    <div className="flex flex-col items-center justify-center w-full py-4">
                      <h3 className="text-xl text-neutral-black-60">
                        No hay productos en el carrito
                      </h3>
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        leftIcon={<Plus />}
                        className="w-[260px] mt-4 shadow-none"
                        onClick={() => {
                          track('add_more_products_opened', { trigger: 'empty_cart' });
                          setIsProductModalOpen(true);
                        }}
                      >
                        AGREGAR PRODUCTOS
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <Separator orientation="horizontal" className="w-full!" />

              <Button
                type="button"
                variant="default"
                size="lg"
                leftIcon={<Plus />}
                className="w-full shadow-none"
                onClick={() => {
                  track('add_more_products_opened', { trigger: 'add_more_button' });
                  setIsProductModalOpen(true);
                }}
              >
                AGREGAR MÁS PRODUCTOS
              </Button>
            </div>

            <div className="flex flex-col items-start gap-8 w-full">
              <CouponInput
                couponCode={couponCode}
                onCouponChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={() => {
                  if (appliedCoupon) removeCodeFromItems(appliedCoupon);

                  removeCoupon();
                }}
                isLoading={isCouponLoading}
                error={couponError ?? undefined}
                appliedCoupon={appliedCoupon}
                requiresLogin={couponRequiresLogin}
                onLoginClose={clearCouponRequiresLogin}
              />

              <OrderTotals
                subtotal={getSubtotal()}
                deliveryFee={getDeliveryFee()}
                items={items}
                total={getTotal()}
                appliedCoupon={appliedCoupon}
              />

              {error && (
                <ErrorCard error={error} onClose={() => setError(null)} />
              )}


              <div className="flex items-center justify-end gap-3 w-full flex-wrap">
                {!user && (
                  <Button
                    type="button"
                    variant="yellow"
                    size="lg"
                    leftIcon={<Star className="fill-current" />}
                    onClick={() => router.push("/login")}
                    style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
                    className="whitespace-normal text-center h-auto py-2 leading-tight flex-1"
                  >
                    REGÍSTRATE PARA<br />ACUMULA PUNTOS
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={items.length === 0}
                  loading={isSubmitting || isCouponLoading}
                  loadingText="ENVIANDO..."
                  className="min-w-[128px]"
                  onClick={async (e) => {
                    // Mostrar diálogo si hay código pendiente y el usuario no está registrado
                    if (!user && pendingPromoCode && !appliedCoupon) {
                      e.preventDefault();
                      setShowPromoDialog(true);
                      return;
                    }
                    // Si hay un código escrito pero aún no aplicado, validarlo primero
                    if (couponCode.trim() && !appliedCoupon) {
                      e.preventDefault();
                      const success = await applyCoupon();
                      if (success) {
                        (e.currentTarget as HTMLButtonElement).form?.requestSubmit();
                      }
                    }
                  }}
                >
                  COMPRAR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <SpikesIcon className="w-full rotate-180" />
      </Card>

      <ProductGridModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent onOpenChange={setShowPromoDialog}>
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center pb-2">
              <span className="text-5xl">🎁</span>
              <DialogTitle className="text-xl font-bold text-neutral-black-80">
                ¡No uses tu código sin registrarte!
              </DialogTitle>
              <DialogDescription className="text-neutral-black-60 text-sm leading-relaxed">
                Tienes el código{" "}
                <strong className="text-neutral-black-80 font-bold">
                  {pendingPromoCode}
                </strong>{" "}
                listo para aplicar. Si continúas sin cuenta, perderás este beneficio.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-3 px-4 pb-6">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setShowPromoDialog(false);
                router.push("/login");
              }}
            >
              REGISTRARME Y USAR EL CÓDIGO
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => {
                setShowPromoDialog(false);
                // Enviar el formulario sin código
                const form = document.querySelector("form");
                form?.requestSubmit();
              }}
            >
              Continuar sin el código
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
