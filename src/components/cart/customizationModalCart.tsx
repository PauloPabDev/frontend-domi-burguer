"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { QuantitySelector } from "../ui/quantitySelector";
import { Complement } from "@/types/products";
import { useCartStore, CartItem } from "@/store/cartStore";
import { favoritosData, otrosData, gaseosasData, iconMap, salsasData, salsasPapasData } from "@/utils/complementSections";
import { Modal } from "@/components/ui/modal";

interface CustomizationModalCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem;
}

export const CustomizationModalCart = ({
  isOpen,
  onClose,
  cartItem,
}: CustomizationModalCartProps) => {
  const { updateItemComplements } = useCartStore();

  // Detectar si es un producto de papas
  const isPapas = cartItem?.customizationType === 'papas';

  const [favoritos, setFavoritos] = useState(favoritosData);
  const [otros, setOtros] = useState(otrosData);
  const [gaseosas, setGaseosas] = useState(gaseosasData);
  const [salsas, setSalsas] = useState(isPapas ? salsasPapasData : salsasData);

  const [isFavoritosOpen, setIsFavoritosOpen] = useState(!isPapas);
  const [isOtrosOpen, setIsOtrosOpen] = useState(!isPapas);
  const [isGaseosasOpen, setIsGaseosasOpen] = useState(false);
  const [isSalsasOpen, setIsSalsasOpen] = useState(isPapas);

  // Sincroniza complementos con el carrito
  useEffect(() => {
    if (isOpen && cartItem) {
      const sync = (list: Complement[]) =>
        list.map((ing) => {
          if (ing.type === "special") {
            const minus = cartItem.complements.some((c) => c.id === ing.minusId);
            if (minus) return { ...ing, quantity: 0 };

            const add = cartItem.complements.find((c) => c.id === ing.additionId);
            return { ...ing, quantity: add ? 1 + add.quantity : 1 };
          }

          if (ing.type === "addable") {
            const add = cartItem.complements.find((c) => c.id === ing.additionId);
            return { ...ing, quantity: add ? add.quantity : 0 };
          }

          if (ing.type === "removable") {
            const removed = cartItem.complements.some((c) => c.id === ing.id);
            return { ...ing, quantity: removed ? 0 : 1 };
          }

          return ing;
        });

      setFavoritos(sync(favoritosData));
      setOtros(sync(otrosData));
      setGaseosas(sync(gaseosasData));
      // Usar salsasPapasData para productos de papas
      setSalsas(sync(isPapas ? salsasPapasData : salsasData));
    }
  }, [cartItem, isOpen, isPapas]);

  const handleIngredientChange = (
    ingredient: Complement,
    action: "plus" | "minus",
    section: "favoritos" | "otros" | "gaseosas" | "salsas"
  ) => {
    if (action === "plus" && ingredient.type === "removable" && ingredient.quantity >= 1)
      return;
    if (action === "minus" && ingredient.quantity <= 0) return;

    const newQuantity =
      action === "plus" ? ingredient.quantity + 1 : ingredient.quantity - 1;

    const updateList = (list: Complement[]) =>
      list.map((i) => (i.id === ingredient.id ? { ...i, quantity: newQuantity } : i));

    if (section === "favoritos") setFavoritos(updateList);
    if (section === "otros") setOtros(updateList);
    if (section === "gaseosas") setGaseosas(updateList);
    if (section === "salsas") setSalsas(updateList);
  };

  const convertToComplements = (): Complement[] => {
    const all = [...favoritos, ...otros, ...gaseosas, ...salsas];
    const complements: Complement[] = [];

    all.forEach((ing) => {
      if (ing.type === "special") {
        if (ing.quantity === 0 && ing.minusId)
          complements.push({
            ...ing,
            id: ing.minusId,
            minusComplement: true,
            quantity: 1,
            price: 0,
          });
        else if (ing.quantity > 1 && ing.additionId)
          complements.push({
            ...ing,
            id: ing.additionId,
            quantity: ing.quantity - 1,
          });
      } else if (ing.type === "addable") {
        if (ing.quantity > 0 && ing.additionId)
          complements.push({
            ...ing,
            id: ing.additionId,
            quantity: ing.quantity,
          });
      } else if (ing.type === "removable" && ing.quantity === 0) {
        complements.push({
          ...ing,
          id: ing.id,
          minusComplement: true,
          quantity: 1,
          price: 0,
        });
      }
    });

    return complements;
  };

  const handleConfirm = () => {
    const rebuiltComplements = convertToComplements();

    // Los complementos de recompensa de un código de referido (rewardCode) no
    // se editan desde este modal. convertToComplements() los reconstruye a
    // partir del catálogo y pierde esa marca, lo que hacía que el ítem
    // recalculara un id igual al de otra línea del mismo producto y se
    // fusionara con ella. Se preservan tal cual venían en el carrito.
    const rewardComplements = cartItem.complements.filter((c) => !!c.rewardCode);
    const rewardIds = new Set(rewardComplements.map((c) => c.id));

    const newComplements = [
      ...rebuiltComplements.filter((c) => !rewardIds.has(c.id)),
      ...rewardComplements,
    ];

    updateItemComplements(cartItem.id, newComplements);
    onClose();
  };

  const renderSection = (
    title: string,
    ingredients: Complement[],
    section: "favoritos" | "otros" | "gaseosas" | "salsas",
    sectionOpen: boolean,
    toggle: () => void,
    description?: string
  ) => (
    <div className="flex flex-col items-start w-full">
      <button
        onClick={toggle}
        className="flex items-center gap-4 px-0 py-3 w-full border-b border-neutral-black-30"
      >
        <div className="flex-1 flex flex-col text-left">
          <span className="body-font font-bold">{title}</span>
          {description && (
            <span className="text-sm text-neutral-black-60 font-normal mt-1">{description}</span>
          )}
        </div>
        {sectionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {sectionOpen && (
        <div className="flex flex-col w-full pt-2">
          {ingredients.map((ingredient) => {
            const Icon = ingredient.icon ? iconMap[ingredient.icon] : null;
            return (
              <div key={ingredient.id} className="flex h-12 items-center gap-4 py-3 rounded-xl">
                {Icon && <Icon />}
                <div className="flex-1 font-medium text-sm leading-4">
                  <span className="text-[#313131]">{ingredient.name}</span>
                  {ingredient.price && (
                    <span className="text-[#808080]"> (+${ingredient.price})</span>
                  )}
                </div>
                <QuantitySelector
                  value={ingredient.quantity}
                  onIncrease={() => handleIngredientChange(ingredient, "plus", section)}
                  onDecrease={() => handleIngredientChange(ingredient, "minus", section)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={`¿QUIERES PERSONALIZAR TU ${cartItem?.name}?`}
      description={isPapas
        ? "Selecciona las salsas o bebidas que deseas agregar."
        : "Selecciona los ingredientes que quieres agregar o los que deseas retirar."}
      size="lg"
      footer={{
        cancel: { label: "CANCELAR" },
        confirm: { label: "CONFIRMAR", onClick: handleConfirm },
      }}
    >
      <div className="flex flex-col gap-4">
        {!isPapas && renderSection("Favoritos", favoritos, "favoritos", isFavoritosOpen, () =>
          setIsFavoritosOpen(!isFavoritosOpen)
        )}
        {!isPapas && renderSection("Otros", otros, "otros", isOtrosOpen, () =>
          setIsOtrosOpen(!isOtrosOpen)
        )}
        {renderSection("Bebidas", gaseosas, "gaseosas", isGaseosasOpen, () =>
          setIsGaseosasOpen(!isGaseosasOpen)
        )}
        {renderSection("Salsas", salsas, "salsas", isSalsasOpen, () =>
          setIsSalsasOpen(!isSalsasOpen), isPapas ? 'Puedes agregar salsas adicionales a tus papas' : 'Manejamos Salsa de Ajo de la casa y Salsa roja (de tomate)')}
      </div>
    </Modal>
  );
};
