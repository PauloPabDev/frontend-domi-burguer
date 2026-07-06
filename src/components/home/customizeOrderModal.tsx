"use client";

import { useState, useEffect } from "react";
import { QuantitySelector } from "../ui/quantitySelector";
import { Complement, CustomizationType } from "@/types/products";
import { favoritosData, otrosData, gaseosasData, iconMap, salsasData, salsasPapasData } from "@/utils/complementSections";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface CustomizationModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  productName?: string;
  productId?: number;
  customizationType?: CustomizationType;
  handleChangeComplement: (ingredient: Complement, action: "plus" | "minus") => void;
  complements?: Complement[];
}

export const CustomizationModalSection = ({
  isOpen,
  onClose,
  onCancel,
  productName = "BURGER",
  productId,
  customizationType = 'burger',
  handleChangeComplement,
  complements = [],
}: CustomizationModalSectionProps) => {
  // Detectar si es un producto de papas
  const isPapas = customizationType === 'papas';

  const [favoritos, setFavoritos] = useState<Complement[]>(favoritosData);
  const [otros, setOtros] = useState<Complement[]>(otrosData);
  const [gaseosas, setGaseosas] = useState<Complement[]>(gaseosasData);
  const [salsas, setSalsas] = useState<Complement[]>([]);

  // Estados de los acordeones
  const [isFavoritosOpen, setIsFavoritosOpen] = useState(!isPapas);
  const [isOtrosOpen, setIsOtrosOpen] = useState(false);
  const [isGaseosasOpen, setIsGaseosasOpen] = useState(false);
  const [isSalsasOpen, setIsSalsasOpen] = useState(isPapas);

  // Sincronizar ingredientes con complementos guardados SOLO al abrir el modal.
  // No poner `complements` en el array de deps para evitar que el useEffect
  // sobreescriba el estado local en cada clic del usuario.
  useEffect(() => {
    if (!isOpen) return;

    const syncIngredients = (ingredients: Complement[]) =>
      ingredients.map((ing) => {
        if (ing.type === "special") {
          const hasVegetariano = complements.some((c) => c.id === ing.minusId);
          if (hasVegetariano) return { ...ing, quantity: 0 };
          const adicion = complements.find((c) => c.id === ing.additionId);
          if (adicion) return { ...ing, quantity: 1 + adicion.quantity };
          return { ...ing, quantity: 1 };
        }

        if (ing.type === "addable") {
          const adicion = complements.find((c) => c.id === ing.additionId);
          return { ...ing, quantity: adicion ? adicion.quantity : 0 };
        }

        if (ing.type === "removable") {
          const hasSinIngrediente = complements.some((c) => c.id === ing.id);
          return { ...ing, quantity: hasSinIngrediente ? 0 : 1 };
        }

        return ing;
      });

    setFavoritos(syncIngredients(favoritosData));
    setOtros(syncIngredients(otrosData));
    setGaseosas(syncIngredients(gaseosasData));
    setSalsas(syncIngredients(isPapas ? salsasPapasData : salsasData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId, isPapas]);

  const handleIngredientChange = (
    ingredient: Complement,
    action: "plus" | "minus",
    section: "favoritos" | "otros" | "gaseosas" | "salsas"
  ) => {
    if (action === "plus" && ingredient.type === "removable" && ingredient.quantity >= 1) {
      return;
    }

    if (action === "minus" && ingredient.quantity <= 0) {
      return;
    }

    const newQuantity =
      action === "plus" ? ingredient.quantity + 1 : ingredient.quantity - 1;

    const updateSection = (prev: Complement[]) =>
      prev.map((i) => (i.id === ingredient.id ? { ...i, quantity: newQuantity } : i));

    if (section === "favoritos") {
      setFavoritos(updateSection);
    } else if (section === "otros") {
      setOtros(updateSection);
    } else if (section === "gaseosas") {
      setGaseosas(updateSection);
    } else if (section === "salsas") {
      setSalsas(updateSection);
    }

    handleChangeComplement(ingredient, action);
  };

  const handleReset = () => {
    setFavoritos(favoritosData);
    setOtros(otrosData);
    setGaseosas(gaseosasData);
    setSalsas(salsasData);
  };

  const renderIngredientSection = (
    ingredients: Complement[],
    section: "favoritos" | "otros" | "gaseosas" | "salsas"
  ) => {
    return ingredients.map((ingredient) => {
      const IconComponent = ingredient.icon ? iconMap[ingredient.icon] : null;
      return (
        <div key={ingredient.id} className="flex h-12 items-center gap-4 py-3 rounded-xl">
          {IconComponent ? (
            <IconComponent />
          ) : (
            <div className="w-6 h-6 bg-accent-yellow-40 rounded-full" />
          )}

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
    });
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
          {renderIngredientSection(ingredients, section)}
        </div>
      )}
    </div>
  );

  const handleCancel = () => {
    handleReset();
    if (onCancel) onCancel();
    else onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleCancel()}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      title={`¿QUIERES PERSONALIZAR TU ${productName}?`}
      description={isPapas
        ? "Selecciona las salsas o bebidas que deseas agregar."
        : "Selecciona los ingredientes que quieres agregar o los que deseas retirar."}
      size="lg"
      footer={{
        cancel: {
          label: "CANCELAR",
          onClick: handleCancel,
        },
        confirm: { label: "CONFIRMAR", onClick: onClose },
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
