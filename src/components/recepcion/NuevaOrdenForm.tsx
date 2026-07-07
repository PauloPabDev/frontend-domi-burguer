"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { addToast } from '@heroui/toast';
import { useNuevaOrden, PAYMENT_METHODS } from '@/hooks/recepcion/useNuevaOrden';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { ClienteSearch } from './ClienteSearch';
import { UbicacionesCliente } from './UbicacionesCliente';
import { ProductoSelector } from './ProductoSelector';
import { SedeSelector } from './SedeSelector';
import { PaymentMethodsSection } from '@/components/cart/PaymentMethodsSection';
import { Button } from '@/components/ui/button';
import { Complement, Product } from '@/types/products';
import { handleAddableComplement, handleSpecialComplement, handleRemovableComplement } from '@/hooks/home/useMenu';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomizationModalSection = dynamic(
  () => import('@/components/home/customizeOrderModal').then((m) => m.CustomizationModalSection),
  { ssr: false }
);

const ModalAddressAdmin = dynamic(
  () => import('./ModalAddressAdmin').then((m) => m.ModalAddressAdmin),
  { ssr: false }
);

export function NuevaOrdenForm() {
  const form = useNuevaOrden();

  useChatwootBus(form.handlePhoneSet);

  const pendingComplementsRef = useRef<Complement[]>([]);
  const originalComplementsRef = useRef<Complement[]>([]);
  const [pendingComplements, setPendingComplements] = useState<Complement[]>([]);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  useEffect(() => {
    if (form.submitSuccess) {
      addToast({
        title: '¡Orden creada exitosamente!',
        description: 'La orden fue registrada y enviada a cocina.',
        color: 'success',
      });
    }
  }, [form.submitSuccess]);

  const handleOpenComplementEditor = useCallback(
    (item: Parameters<typeof form.openComplementEditor>[0]) => {
      const initial = [...item.complements];
      pendingComplementsRef.current = initial;
      originalComplementsRef.current = initial;
      setPendingComplements(initial);
      form.openComplementEditor(item);
    },
    [form]
  );

  const handleAddProduct = useCallback(
    (product: Product) => {
      if (form.showComplementModal) return;
      if (product.allowCustomization) {
        const initial = [...product.complements];
        pendingComplementsRef.current = initial;
        originalComplementsRef.current = initial;
        setPendingComplements(initial);
        form.addProductAndEdit(product);
      } else {
        form.addProduct(product);
      }
    },
    [form]
  );

  const handleChangeComplement = useCallback((ingredient: Complement, action: 'plus' | 'minus') => {
    const newQuantity = action === 'plus' ? ingredient.quantity + 1 : ingredient.quantity - 1;
    const current = pendingComplementsRef.current;

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

    // Fallback: handleAddableComplement and handleSpecialComplement return empty arrays
    // when the complement already exists at qty > 1 (addable) or qty > 2 (special).
    // In those cases, increment/decrement the existing entry directly so that
    // pendingComplements stays in sync and the modal's useEffect doesn't clobber the display.
    if (
      (ingredient.type === 'addable' || ingredient.type === 'special') &&
      result.complementsToAdd.length === 0 &&
      result.complementsToRemove.length === 0
    ) {
      const targetId = ingredient.additionId ?? ingredient.id;
      const existingEntry = updated.find((c) => c.id === targetId);
      if (existingEntry) {
        if (action === 'plus') {
          updated = updated.map((c) =>
            c.id === targetId ? { ...c, quantity: c.quantity + 1 } : c
          );
        } else if (action === 'minus') {
          updated = updated
            .map((c) => c.id === targetId ? { ...c, quantity: Math.max(0, c.quantity - 1) } : c)
            .filter((c) => c.id !== targetId || c.quantity > 0);
        }
      }
    }

    pendingComplementsRef.current = updated;
    setPendingComplements(updated);
  }, []);

  const handleConfirmComplements = useCallback(() => {
    form.confirmComplements(pendingComplementsRef.current);
  }, [form]);

  const handleCancelComplements = useCallback(() => {
    form.confirmComplements(originalComplementsRef.current);
  }, [form]);

  const handleOpenAddressModal = useCallback(() => {
    form.setShowCreateLocationModal(true);
  }, [form]);

  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`;
  const totalUnidades = form.orderItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full px-4 lg:px-8 py-6 flex flex-col gap-5">



      {/* ── Main layout: stacked on mobile, two-column on lg+ ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ════ LEFT COLUMN: configuración de la orden ════ */}
        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">

          {/* Cliente */}
          <section className="flex flex-col gap-4 p-5 rounded-xl border border-neutral-black-20 bg-white shadow-sm">
            <ClienteSearch
              phone={form.phone}
              onPhoneChange={form.setPhone}
              clientState={form.clientState}
              client={form.client}
              onSearch={form.searchClient}
              onCreateClient={form.createClient}
            />
          </section>

          {/* Dirección */}
          <section className={cn(
            'flex flex-col gap-4 p-5 rounded-xl border bg-white shadow-sm transition-opacity duration-200',
            !form.client
              ? 'border-neutral-black-10 opacity-40 pointer-events-none'
              : 'border-neutral-black-20'
          )}>
            <UbicacionesCliente
              locations={form.locations}
              loading={form.locationsLoading}
              selectedLocationId={form.selectedLocationId}
              delivery={form.delivery}
              deliveryLoading={form.deliveryLoading}
              deliveryError={form.deliveryError}
              clientId={form.client?.id ?? null}
              onSelectLocation={form.handleSelectLocation}
              onCreateLocation={handleOpenAddressModal}
              onRetryDelivery={form.selectedLocationId
                ? () => form.handleSelectLocation(form.selectedLocationId!)
                : undefined}
            />
          </section>

          {/* Sede */}
          <section className="flex flex-col gap-4 p-5 rounded-xl border border-neutral-black-20 bg-white shadow-sm">
            <SedeSelector
              kitchens={form.kitchens}
              loading={form.kitchensLoading}
              value={form.selectedKitchenId}
              detectedKitchen={form.kitchen}
              onChange={form.handleKitchenChange}
            />
          </section>

          {/* Método de pago */}
          <section className="flex flex-col gap-4 p-5 rounded-xl border border-neutral-black-20 bg-white shadow-sm">
            <PaymentMethodsSection
              paymentMethods={PAYMENT_METHODS}
              selectedMethod={form.paymentMethod}
              onChange={(e) => form.setPaymentMethod(e.target.value)}
            />
          </section>

        </div>

        {/* ════ RIGHT COLUMN: productos, comentario, resumen ════ */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Productos */}
          <section className="flex flex-col gap-4 p-5 rounded-xl border border-neutral-black-20 bg-white shadow-sm">
            <ProductoSelector
              allProducts={form.allProducts}
              orderItems={form.orderItems}
              onAdd={handleAddProduct}
              onChangeQuantity={form.changeQuantity}
              onEditComplements={handleOpenComplementEditor}
            />
          </section>

          {/* Comentario */}
          <section className="flex flex-col gap-3 p-5 rounded-xl border border-neutral-black-20 bg-white shadow-sm">
            <h3 className="font-bold text-sm text-neutral-black-80">Comentario (opcional)</h3>
            <textarea
              value={form.comment}
              onChange={(e) => form.setComment(e.target.value)}
              placeholder="Instrucciones especiales para la orden..."
              rows={2}
              className="w-full rounded-lg border border-neutral-black-20 px-3 py-2 text-sm text-neutral-black-80 placeholder:text-neutral-black-40 resize-none focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red"
            />
          </section>

          {/* Resumen de la orden */}
          {form.orderItems.length > 0 && (
            <section className="rounded-xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">

              {/* Header colapsable */}
              <button
                type="button"
                onClick={() => setSummaryExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-black-5 transition-colors"
              >
                <h3 className="font-bold text-sm text-neutral-black-80">Resumen del pedido</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-red">{fmt(form.total)}</span>
                  {summaryExpanded
                    ? <ChevronUp className="w-4 h-4 text-neutral-black-40" />
                    : <ChevronDown className="w-4 h-4 text-neutral-black-40" />
                  }
                </div>
              </button>

              {summaryExpanded && (
                <div className="px-5 pb-5 flex flex-col gap-3 border-t border-neutral-black-10">

                  {/* Desglose por ítem */}
                  <div className="flex flex-col gap-2 pt-3">
                    {form.orderItems.map((item) => {
                      const additions = item.complements.filter((c) => !c.minusComplement && c.name);
                      const removals = item.complements.filter((c) => c.minusComplement && c.name);
                      return (
                        <div key={item.itemId} className="flex gap-3 py-2 border-b border-neutral-black-10 last:border-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-medium text-neutral-black-80">{item.product.name}</span>
                              {item.quantity > 1 && (
                                <span className="text-xs text-neutral-black-40">×{item.quantity}</span>
                              )}
                            </div>
                            {item.quantity > 1 && (
                              <p className="text-xs text-neutral-black-40">{fmt(item.product.price)} c/u</p>
                            )}
                            {additions.length > 0 && (
                              <p className="text-xs text-green-600 mt-0.5">
                                + {additions.map((c) => c.name).join(', ')}
                              </p>
                            )}
                            {removals.length > 0 && (
                              <p className="text-xs text-neutral-black-40 line-through mt-0.5">
                                {removals.map((c) => c.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-neutral-black-80 shrink-0">
                            {fmt(item.product.price * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totales */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between text-sm text-neutral-black-60">
                      <span>Subtotal ({totalUnidades} {totalUnidades === 1 ? 'producto' : 'productos'})</span>
                      <span>{fmt(form.subtotal)}</span>
                    </div>
                    {form.delivery && (
                      <div className="flex justify-between text-sm text-neutral-black-60">
                        <span className="flex items-center gap-1.5">
                          Domicilio
                          {form.delivery.distance > 0 && (
                            <span className="text-neutral-black-40 text-xs">
                              {(form.delivery.distance / 1000).toFixed(1)} km
                              {form.delivery.duration ? ` · ~${Math.round(form.delivery.duration / 60)} min` : ''}
                            </span>
                          )}
                        </span>
                        <span>{fmt(form.delivery.price)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base text-neutral-black-80 pt-2 border-t border-neutral-black-20">
                      <span>Total</span>
                      <span className="text-primary-red">{fmt(form.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Error */}
          {form.submitError && (
            <p className="text-sm text-red-500 text-center px-2">{form.submitError}</p>
          )}

          {/* Botón principal */}
          <Button
            type="button"
            onClick={form.handleSubmit}
            disabled={form.isSubmitting || !form.client || !form.selectedLocationId || form.orderItems.length === 0}
            className="w-full h-12 text-sm font-bold"
          >
            {form.isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creando orden...</>
            ) : (
              `Crear Orden${totalUnidades > 0 ? ` · ${fmt(form.total)}` : ''}`
            )}
          </Button>

        </div>
      </div>

      {/* ── Modals ── */}
      {form.showComplementModal && form.editingItem && (
        <CustomizationModalSection
          isOpen={form.showComplementModal}
          onClose={handleConfirmComplements}
          onCancel={handleCancelComplements}
          productName={form.editingItem.product.name}
          productId={form.editingItem.product.id}
          customizationType={form.editingItem.product.customizationType}
          handleChangeComplement={handleChangeComplement}
          complements={pendingComplements}
        />
      )}

      {form.showCreateLocationModal && form.client && (
        <ModalAddressAdmin
          isOpen={form.showCreateLocationModal}
          onClose={() => form.setShowCreateLocationModal(false)}
          clientId={form.client.id}
          onCreated={form.handleLocationCreated}
        />
      )}
    </div>
  );
}
