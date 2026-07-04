"use client";

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useNuevaOrden, PAYMENT_METHODS } from '@/hooks/recepcion/useNuevaOrden';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { ClienteSearch } from './ClienteSearch';
import { UbicacionesCliente } from './UbicacionesCliente';
import { ProductoSelector } from './ProductoSelector';
import { PaymentMethodsSection } from '@/components/cart/PaymentMethodsSection';
import { Button } from '@/components/ui/button';
import { Complement } from '@/types/products';
import { handleAddableComplement, handleSpecialComplement, handleRemovableComplement } from '@/hooks/home/useMenu';
import { CheckCircle, Loader2 } from 'lucide-react';
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

  // Chatwoot integration — pre-fills phone when embedded as Dashboard App
  useChatwootBus(form.handlePhoneSet);

  // Local pending complements state for the complement editor
  const pendingComplementsRef = useRef<Complement[]>([]);
  const [pendingComplements, setPendingComplements] = useState<Complement[]>([]);

  const handleOpenComplementEditor = useCallback(
    (item: Parameters<typeof form.openComplementEditor>[0]) => {
      const initial = [...item.complements];
      pendingComplementsRef.current = initial;
      setPendingComplements(initial);
      form.openComplementEditor(item);
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

    pendingComplementsRef.current = updated;
    setPendingComplements(updated);
  }, []);

  const handleCloseComplementModal = useCallback(() => {
    form.confirmComplements(pendingComplementsRef.current);
    form.setShowComplementModal(false);
  }, [form]);

  const handleOpenAddressModal = useCallback(() => {
    form.setShowCreateLocationModal(true);
  }, [form]);

  const formatCurrency = (n: number) => `$${n.toLocaleString('es-CO')}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Success banner */}
      {form.submitSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-sm">¡Orden creada exitosamente!</p>
            <p className="text-xs text-green-600">Puedes crear otra orden en cualquier momento.</p>
          </div>
        </div>
      )}

      {/* Step 1: Client */}
      <section className="flex flex-col gap-4 p-4 rounded-xl border border-neutral-black-20 bg-white">
        <ClienteSearch
          phone={form.phone}
          onPhoneChange={form.setPhone}
          clientState={form.clientState}
          client={form.client}
          onSearch={form.searchClient}
          onCreateClient={form.createClient}
        />
      </section>

      {/* Step 2: Location */}
      <section className={cn(
        'flex flex-col gap-4 p-4 rounded-xl border bg-white transition-opacity',
        !form.client ? 'border-neutral-black-10 opacity-50 pointer-events-none' : 'border-neutral-black-20'
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

      {/* Step 3: Payment */}
      <section className={cn(
        'flex flex-col gap-4 p-4 rounded-xl border bg-white transition-opacity',
        !form.client ? 'border-neutral-black-10 opacity-50 pointer-events-none' : 'border-neutral-black-20'
      )}>
        <PaymentMethodsSection
          paymentMethods={PAYMENT_METHODS}
          selectedMethod={form.paymentMethod}
          onChange={(e) => form.setPaymentMethod(e.target.value)}
        />
      </section>

      {/* Step 4: Products */}
      <section className={cn(
        'flex flex-col gap-4 p-4 rounded-xl border bg-white transition-opacity',
        !form.client ? 'border-neutral-black-10 opacity-50 pointer-events-none' : 'border-neutral-black-20'
      )}>
        <ProductoSelector
          allProducts={form.allProducts}
          orderItems={form.orderItems}
          onAdd={form.addProduct}
          onChangeQuantity={form.changeQuantity}
          onEditComplements={handleOpenComplementEditor}
        />
      </section>

      {/* Step 5: Comment */}
      <section className={cn(
        'flex flex-col gap-3 p-4 rounded-xl border bg-white transition-opacity',
        !form.client ? 'border-neutral-black-10 opacity-50 pointer-events-none' : 'border-neutral-black-20'
      )}>
        <h3 className="font-bold text-sm text-neutral-black-80">Comentario (opcional)</h3>
        <textarea
          value={form.comment}
          onChange={(e) => form.setComment(e.target.value)}
          placeholder="Instrucciones especiales para la orden..."
          rows={3}
          className="w-full rounded-lg border border-neutral-black-20 px-3 py-2 text-sm text-neutral-black-80 placeholder:text-neutral-black-40 resize-none focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red"
        />
      </section>

      {/* Order summary + submit */}
      {form.orderItems.length > 0 && (
        <section className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-black-20 bg-neutral-black-10">
          <h3 className="font-bold text-sm text-neutral-black-80">Resumen</h3>
          <div className="flex justify-between text-xs text-neutral-black-60">
            <span>Subtotal ({form.orderItems.reduce((s, i) => s + i.quantity, 0)} productos)</span>
            <span>{formatCurrency(form.subtotal)}</span>
          </div>
          {form.delivery && (
            <div className="flex justify-between text-xs text-neutral-black-60">
              <span>Domicilio</span>
              <span>{formatCurrency(form.delivery.price)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-neutral-black-80 border-t border-neutral-black-20 pt-2">
            <span>Total</span>
            <span>{formatCurrency(form.total)}</span>
          </div>
        </section>
      )}

      {form.submitError && (
        <p className="text-sm text-red-500 text-center px-4">{form.submitError}</p>
      )}

      <Button
        type="button"
        onClick={form.handleSubmit}
        disabled={form.isSubmitting || !form.client || !form.selectedLocationId || form.orderItems.length === 0}
        className="w-full h-12 text-sm font-bold"
      >
        {form.isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creando orden...</>
        ) : (
          'Crear Orden'
        )}
      </Button>

      {/* Complement editor modal */}
      {form.showComplementModal && form.editingItem && (
        <CustomizationModalSection
          isOpen={form.showComplementModal}
          onClose={handleCloseComplementModal}
          productName={form.editingItem.product.name}
          productId={form.editingItem.product.id}
          customizationType={form.editingItem.product.customizationType}
          handleChangeComplement={handleChangeComplement}
          complements={pendingComplements}
        />
      )}

      {/* New address modal */}
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
