"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, Lock, Minus, Sparkles, PartyPopper, Star, Heart, Smile, IceCream2, Candy, Cookie } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Complement } from "@/types/products";
import { cn } from "@/lib/utils";

// Íconos "divertidos" que reemplazan la inicial del nombre mientras el
// complemento no está seleccionado — se elige uno por id, de forma
// determinística, para que cada tarjeta tenga variedad sin cambiar en cada render.
const FUN_ICONS = [Sparkles, PartyPopper, Star, Heart, Smile, IceCream2, Candy, Cookie];

const funIconFor = (id: Complement["id"]) => {
  const hash = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FUN_ICONS[hash % FUN_ICONS.length];
};

interface ComplementesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  productName?: string;
  allComplements: Complement[];
  complementsLoading: boolean;
  complements?: Complement[];
  handleChangeComplement: (complement: Complement, action: "plus" | "minus") => void;
}

// Búsqueda insensible a mayúsculas/acentos ("Jugo de mora" matches "jugo mora").
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Modal de complementos exclusivo de recepción. A diferencia del modal del
// cliente (customizeOrderModal.tsx, que sigue usando la data estática por
// secciones), aquí la lista completa de complementos viene de la API
// (useNuevaOrden.allComplements, traída una sola vez) y el buscador del
// header filtra esa copia localmente, sin volver a pegarle a la API.
export const ComplementesModal = ({
  isOpen,
  onClose,
  onCancel,
  productName = "PRODUCTO",
  allComplements,
  complementsLoading,
  complements = [],
  handleChangeComplement,
}: ComplementesModalProps) => {
  const [search, setSearch] = useState("");

  // Limpia la búsqueda cada vez que se abre el modal para un nuevo ítem.
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const filteredComplements = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return allComplements;
    return allComplements.filter((c) => c.name && normalize(c.name).includes(term));
  }, [allComplements, search]);

  const quantityFor = (id: Complement["id"]) =>
    complements.find((c) => c.id === id)?.quantity ?? 0;

  const handleCancel = () => {
    setSearch("");
    if (onCancel) onCancel();
    else onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleCancel()}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      size="lg"
      customHeader={
        <div className="flex flex-col gap-3 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 border-b border-neutral-black-10">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-bold text-neutral-black-80 leading-tight tracking-tight text-lg sm:text-xl">
              {`¿QUIERES PERSONALIZAR TU ${productName}?`}
            </h2>
            <p className="text-neutral-black-50 leading-relaxed text-sm sm:text-base">
              Busca y agrega los complementos que quieras sumar al pedido.
            </p>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-black-50 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Buscar complemento por nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-black-50 hover:text-neutral-black-80"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      }
      footer={{
        cancel: { label: "CANCELAR", onClick: handleCancel },
        confirm: { label: "CONFIRMAR", onClick: onClose },
      }}
    >
      <div>
        {complementsLoading && (
          <p className="text-sm text-neutral-black-50 py-6 text-center">
            Cargando complementos…
          </p>
        )}

        {!complementsLoading && filteredComplements.length === 0 && (
          <p className="text-sm text-neutral-black-50 py-6 text-center">
            {allComplements.length === 0
              ? "No hay complementos disponibles."
              : `No se encontraron complementos para "${search}".`}
          </p>
        )}

        {!complementsLoading && filteredComplements.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {filteredComplements.map((complement) => {
              const quantity = quantityFor(complement.id);
              const selected = quantity > 0;
              const FunIcon = funIconFor(complement.id);
              return (
                <div
                  key={complement.id}
                  className={cn(
                    "relative rounded-xl border transition-colors",
                    selected
                      ? "border-primary-red bg-primary-red/5"
                      : "border-neutral-black-20 bg-neutral-black-5"
                  )}
                >
                  {/* Toda la tarjeta agrega una unidad — el botón de reducir (cuando aparece) va encima y
                      queda fuera de este botón, así que un tap fuera de él siempre suma. */}
                  <button
                    type="button"
                    onClick={() => handleChangeComplement({ ...complement, quantity }, "plus")}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 text-left transition-colors",
                      selected ? "pr-11" : "pr-2.5"
                    )}
                    aria-label={`Agregar ${complement.name}`}
                  >
                    <span
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text font-black ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: complement.colorPrimary || "#9ca3af" }}
                      title="Color primario"
                    >
                      {selected ? quantity : <FunIcon size={14} />}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1">
                        <span
                          className="text-sm font-semibold text-neutral-black-80 leading-snug truncate"
                          title={complement.name}
                        >
                          {complement.name}
                        </span>
                        {complement.secret && (
                          <span
                            className="shrink-0 bg-neutral-black-80/80 text-white rounded-full p-1"
                            title="Producto secreto"
                          >
                            <Lock size={9} />
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-neutral-black-50">
                        {complement.price ? `+$${complement.price.toLocaleString("es-CO")}` : "Sin costo"}
                      </span>
                    </span>
                  </button>

                  {/* Botón de reducir — solo aparece cuando el producto ya está seleccionado */}
                  {selected && (
                    <button
                      type="button"
                      onClick={() => handleChangeComplement({ ...complement, quantity }, "minus")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-red text-white hover:bg-primary-red/90 active:scale-95 flex items-center justify-center shadow-sm transition-all"
                      aria-label={`Quitar una unidad de ${complement.name}`}
                      title={`Quitar una unidad (cantidad: ${quantity})`}
                    >
                      <Minus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
