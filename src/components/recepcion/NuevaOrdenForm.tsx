"use client";

import { useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { addToast } from '@heroui/toast';
import { useNuevaOrden, PAYMENT_METHODS, OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import { useComplementEditor } from '@/hooks/recepcion/useComplementEditor';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { ClienteSearch } from './ClienteSearch';
import { UbicacionesCliente } from './UbicacionesCliente';
import { ProductoSelector } from './ProductoSelector';
import { SedeSelector } from './SedeSelector';
import { ResumenPedido } from './ResumenPedido';
import { FormCard } from './FormCard';
import { PaymentMethodsSection } from '@/components/cart/PaymentMethodsSection';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/products';
import { Loader2 } from 'lucide-react';

const CustomizationModalSection = dynamic(
  () => import('@/components/home/customizeOrderModal').then((m) => m.CustomizationModalSection),
  { ssr: false }
);

const ModalAddressAdmin = dynamic(
  () => import('./ModalAddressAdmin').then((m) => m.ModalAddressAdmin),
  { ssr: false }
);

const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`;

export function NuevaOrdenForm() {
  const form = useNuevaOrden();
  const complementEditor = useComplementEditor(form.confirmComplements);

  useChatwootBus(form.handlePhoneSet);

  useEffect(() => {
    if (form.submitSuccess) {
      addToast({
        title: '¡Orden creada exitosamente!',
        description: 'La orden fue registrada y enviada a cocina.',
        color: 'success',
      });
    }
  }, [form.submitSuccess]);

  const handleOpenComplementEditor = useCallback((item: OrderItem) => {
    console.log('Opening complement editor for item:', item);
    complementEditor.initEditor(item.complements);
    form.openComplementEditor(item);
  }, [complementEditor, form]);

  const handleAddProduct = useCallback((product: Product) => {
    if (form.showComplementModal) return;
    form.addProduct(product);
  }, [form]);

  const totalUnidades = form.orderItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full px-4 lg:px-8 py-6 flex flex-col gap-5">

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">
          <FormCard>
            <ClienteSearch
              phone={form.phone}
              onPhoneChange={form.setPhone}
              clientState={form.clientState}
              client={form.client}
              onSearch={form.searchClient}
              onCreateClient={form.createClient}
            />
          </FormCard>

          <FormCard disabled={!form.client}>
            <UbicacionesCliente
              locations={form.locations}
              loading={form.locationsLoading}
              selectedLocationId={form.selectedLocationId}
              delivery={form.delivery}
              deliveryLoading={form.deliveryLoading}
              deliveryError={form.deliveryError}
              clientId={form.client?.id ?? null}
              onSelectLocation={form.handleSelectLocation}
              onCreateLocation={() => form.setShowCreateLocationModal(true)}
              onRetryDelivery={form.selectedLocationId
                ? () => form.handleSelectLocation(form.selectedLocationId!)
                : undefined}
            />
          </FormCard>

          <FormCard>
            <SedeSelector
              kitchens={form.kitchens}
              loading={form.kitchensLoading}
              value={form.selectedKitchenId}
              detectedKitchen={form.kitchen}
              onChange={form.handleKitchenChange}
            />
          </FormCard>

          <FormCard>
            <PaymentMethodsSection
              paymentMethods={PAYMENT_METHODS}
              selectedMethod={form.paymentMethod}
              onChange={(e) => form.setPaymentMethod(e.target.value)}
            />
          </FormCard>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <FormCard>
            <ProductoSelector
              allProducts={form.allProducts}
              orderItems={form.orderItems}
              onAdd={handleAddProduct}
              onChangeQuantity={form.changeQuantity}
              onEditComplements={handleOpenComplementEditor}
            />
          </FormCard>

          <FormCard>
            <h3 className="font-bold text-sm text-neutral-black-80">Comentario (opcional)</h3>
            <textarea
              value={form.comment}
              onChange={(e) => form.setComment(e.target.value)}
              placeholder="Instrucciones especiales para la orden..."
              rows={2}
              className="w-full rounded-lg border border-neutral-black-20 px-3 py-2 text-sm text-neutral-black-80 placeholder:text-neutral-black-40 resize-none focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red"
            />
          </FormCard>

          <ResumenPedido
            orderItems={form.orderItems}
            subtotal={form.subtotal}
            total={form.total}
            delivery={form.delivery}
          />

          {form.submitError && (
            <p className="text-sm text-red-500 text-center px-2">{form.submitError}</p>
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
              `Crear Orden${totalUnidades > 0 ? ` · ${fmt(form.total)}` : ''}`
            )}
          </Button>
        </div>
      </div>

      {form.showComplementModal && form.editingItem && (
        <CustomizationModalSection
          isOpen={form.showComplementModal}
          onClose={complementEditor.handleConfirm}
          onCancel={complementEditor.handleCancel}
          productName={form.editingItem.product.name}
          productId={form.editingItem.product.id}
          customizationType={form.editingItem.product.customizationType}
          handleChangeComplement={complementEditor.handleChange}
          complements={complementEditor.pendingComplements}
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
