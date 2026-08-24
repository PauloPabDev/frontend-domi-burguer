"use client";

import { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { notify } from '@/utils/notify';
import { useNuevaOrden, PAYMENT_METHODS, OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import { useComplementEditor } from '@/hooks/recepcion/useComplementEditor';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { ClienteSearch } from './ClienteSearch';
import { PersonaOrdersSection } from './cliente/PersonaOrdersSection';
import { UbicacionesCliente } from './UbicacionesCliente';
import { ProductoSelector } from './ProductoSelector';
import { SedeSelector } from './SedeSelector';
import { ResumenPedido } from './ResumenPedido';
import { FormCard } from './FormCard';
import { PaymentMethodsSection } from '@/components/cart/PaymentMethodsSection';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/products';
import { Loader2, XCircle } from 'lucide-react';

function SubmitOverlay({
  isSubmitting,
  error,
  onRetry,
  onClose,
}: {
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  if (!isSubmitting && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 max-w-sm w-full mx-4 flex flex-col items-center gap-5">
        {isSubmitting && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary-red/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary-red animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-bold text-neutral-black-80 text-xl">Creando orden...</p>
              <p className="text-sm text-neutral-black-40 mt-1">Por favor espera un momento</p>
            </div>
          </>
        )}
        {!isSubmitting && error && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-neutral-black-80 text-xl">Error al crear la orden</p>
              <p className="text-sm text-red-500 mt-2">{error}</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1 h-11">
                Cerrar
              </Button>
              <Button onClick={onRetry} className="flex-1 h-11 font-bold">
                Reintentar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Modal de complementos propio de recepción (buscador contra la API) — no
// comparte componente con el modal del cliente (customizeOrderModal.tsx),
// que sigue usando la data estática por secciones sin tocarse.
const ComplementesModal = dynamic(
  () => import('./ComplementesModal').then((m) => m.ComplementesModal),
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
      notify.success('¡Orden creada!', 'La orden fue enviada a cocina.');
      form.resetForm();
    }
  }, [form.submitSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5">

      <div className="flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-6 items-start">

        <div className="w-full md:flex-1 flex flex-col gap-4 md:sticky md:top-[112px]">
          <FormCard>
            <ClienteSearch
              phone={form.phone}
              onPhoneChange={form.setPhone}
              clientState={form.clientState}
              client={form.client}
              onSearch={form.searchClient}
              onCreateClient={form.createClient}
              onUpdateName={form.updateClientName}
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
              onDeleteLocation={form.handleLocationDeleted}
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

          {form.client && (
            <FormCard>
              <PersonaOrdersSection orders={form.orders} loading={form.ordersLoading} />
            </FormCard>
          )}
        </div>

        <div className="w-full flex-1 flex flex-col gap-4 min-w-0">
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
            originalDeliveryPrice={form.originalDeliveryPrice}
            onOverrideDeliveryPrice={form.overrideDeliveryPrice}
            onResetDeliveryPrice={form.resetDeliveryPrice}
          />

          <div className="sticky bottom-3 lg:static z-10">
            <Button
              type="button"
              onClick={form.handleSubmit}
              disabled={form.isSubmitting || !form.client || !form.selectedLocationId || form.orderItems.length === 0}
              className="w-full h-12 text-sm font-bold shadow-lg lg:shadow-none"
            >
              {`Crear Orden${totalUnidades > 0 ? ` · ${fmt(form.total)}` : ''}`}
            </Button>
          </div>
        </div>
      </div>

      {form.showComplementModal && form.editingItem && (
        <ComplementesModal
          isOpen={form.showComplementModal}
          onClose={complementEditor.handleConfirm}
          onCancel={complementEditor.handleCancel}
          productName={form.editingItem.product.name}
          allComplements={form.allComplements}
          complementsLoading={form.complementsLoading}
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

      <SubmitOverlay
        isSubmitting={form.isSubmitting}
        error={form.submitError}
        onRetry={form.handleSubmit}
        onClose={form.clearSubmitError}
      />
    </div>
  );
}
