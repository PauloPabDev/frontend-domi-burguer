"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowIcon, EditarIcon, HamburgerIcon } from "@/components/ui/icons";
import { useMenu } from "@/hooks/home/useMenu";
import { useState, useCallback, useEffect, useRef } from "react";
import { QuantitySelector } from "@/components/ui/quantitySelector";
import { showFoodToast } from "../toastFood";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { ComplementsLarge } from "../ui/complementsLarge";
import { track } from "@/utils/analytics";
import { useTrackSectionView } from "@/hooks/useTrackSectionView";
import { ProductThumbnail, PRODUCT_CARD_IMAGES } from "./ProductThumbnail";

// Lazy load modal pesado
const CustomizationModalSection = dynamic(
  () =>
    import("./customizeOrderModal").then((mod) => mod.CustomizationModalSection),
  { ssr: false },
);

export default function MenuSection() {
  const {
    products,
    actualProduct,
    currentProduct,
    handleIncrease,
    handleDecrease,
    handleChangeProduct,
    handleChangeComplement,
    handleRemoveComplement,
    resetCurrentProduct,
  } = useMenu();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleAddToCart } = useAddToCart();
  const menuSectionRef = useTrackSectionView('menu_products');
  const currentProductRef = useRef(currentProduct);
  currentProductRef.current = currentProduct;

  // Configurar Embla Carousel para el carrusel principal
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    duration: 20,
    align: "center",
  });
  // Sincronizar el carrusel principal con el producto actual
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(actualProduct, false);
    }
  }, [actualProduct, emblaApi]);

  // Actualizar el producto cuando cambia el slide
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    if (index !== actualProduct) {
      handleChangeProduct(index);
    }
  }, [emblaApi, actualProduct, handleChangeProduct]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Manejar navegación con botones
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      track('carousel_navigated', { direction: 'prev', from_product: currentProductRef.current.name });
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      track('carousel_navigated', { direction: 'next', from_product: currentProductRef.current.name });
    }
  }, [emblaApi]);

  const handleEditProduct = () => {
    track('product_customization_opened', { product_name: currentProduct.name, product_id: currentProduct.id });
    setIsModalOpen(true);
  };

  return (
    <>
      <section ref={menuSectionRef} className="grid grid-cols-1 xl:grid-cols-2 gap-0 max-w-[1440px] w-screen">
        {/* Columna 1 - Carrusel Principal */}
        <div className="flex flex-col items-start justify-center gap-2 bg-[linear-gradient(45deg,rgba(255,194,5,1)_0%,rgba(255,194,5,0.4)_100%)] max-w-[720px] w-full mx-auto relative overflow-hidden">
          <div className="w-full h-[30px] xl:h-[14px]" />

          <div className="w-full aspect-[1/1] relative" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-[0_0_100%] min-w-0 relative"
                >
                  <div className="w-full aspect-[1/1] relative">
                    <Image
                      src={product.bigImage}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      sizes="(max-width: 1279px) 100vw, 720px"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de navegación */}
            <div className="w-full max-w-[720px] px-[13%] py-0 absolute top-[43%] left-0 flex justify-between z-10 pointer-events-none">
              <Button
                variant="light-outline"
                size="icon"
                className="md:h-14 md:w-14 active:scale-95 pointer-events-auto"
                onClick={scrollPrev}
              >
                <ArrowIcon className="w-5 h-5 rotate-180 text-neutral-black-80" />
              </Button>
              <Button
                variant="light-outline"
                size="icon"
                className="md:h-14 md:w-14 active:scale-95 pointer-events-auto"
                onClick={scrollNext}
              >
                <ArrowIcon className="w-5 h-5 text-neutral-black-80" />
              </Button>
            </div>
          </div>
        </div>

        {/* Columna 2 - Información del Producto 56 32*/}
        <div className="flex flex-col items-center justify-center p-10 md:p-20 md:pt-30 bg-accent-yellow-10 max-w-[720px] w-full mx-auto">
          <div className="flex flex-col w-full max-w-[400px] items-center gap-6 mb-8 md:mb-5">
            <div className="transition-opacity duration-300">
              <h1 className="text-center">
                {currentProduct.name.startsWith("HAMBURGUESA") ? (
                  <>
                    HAMBURGUESA <br />
                    {currentProduct.name.replace("HAMBURGUESA ", "")}
                  </>
                ) : (
                  currentProduct.name
                )}
              </h1>
            </div>
            <div className="flex items-center justify-center gap-5 text-[#808080]">
              {currentProduct.icons.map((Icon, index) => (
                <Icon key={index} />
              ))}
            </div>
            <p className="text-center body-font max-w-[350px] transition-opacity duration-300">
              {currentProduct.body}
            </p>
            <Button
              variant="outline"
              size="md"
              rightIcon={<EditarIcon className="w-4 h-4" />}
              className={`w-[177px] ${!currentProduct.allowCustomization ? "hidden" : ""}`}
              onClick={() => handleEditProduct()}
            >
              PERSONALIZAR
            </Button>
          </div>

          <div className="w-full mb-8 md:mb-12">
            <ComplementsLarge
              complements={currentProduct.complements}
              onRemove={handleRemoveComplement}
            />
          </div>

          <div className="flex w-full max-w-[720px] items-center justify-center gap-6 mb-8 md:mb-12">
            <QuantitySelector
              value={currentProduct.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              size="lg"
            />
            <div>
              <h1 className="font-bold! text-[28px]! md:text-[32px]! leading-[30px]! md:leading-[28px]!">
                $
                {(currentProduct.price * currentProduct.quantity).toLocaleString(
                  "es-CO",
                )}
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full max-w-[720px] items-center justify-center gap-3 sm:gap-6">
            <Link href={"/cart"}>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<HamburgerIcon className="w-6 h-6" />}
                className="w-[199px] transition-all hover:scale-105 active:scale-95"
                onClick={() => {
                  handleAddToCart(currentProduct);
                  showFoodToast(currentProduct.name);
                  resetCurrentProduct();
                }}
              >
                PAGAR AHORA
              </Button>
            </Link>
            <Button
              variant="yellow"
              size="lg"
              className="w-[215px] transition-all hover:scale-105 active:scale-95"
              onClick={() => {
                handleAddToCart(currentProduct);
                showFoodToast(currentProduct.name);
                resetCurrentProduct();
              }}
            >
              AÑADIR AL CARRITO
            </Button>
          </div>
        </div>
      </section>

      {/* Sección de miniaturas de productos */}
      <section className="grid lg:gap-y-14 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-center justify-center lg:gap-6 gap-2 gap-x-4 py-14 relative">
        {products.map((product, index) => (
          <ProductThumbnail
            key={product.id}
            product={product}
            isActive={actualProduct === index}
            onSelect={() => {
              handleChangeProduct(index);
              if (emblaApi) emblaApi.scrollTo(index);
            }}
            onAddToCart={(p) => {
              handleAddToCart(p);
              resetCurrentProduct();
            }}
            images={PRODUCT_CARD_IMAGES[index] ?? []}
          />
        ))}
      </section>

      <CustomizationModalSection
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={currentProduct.name}
        productId={currentProduct.id}
        customizationType={currentProduct.customizationType}
        handleChangeComplement={handleChangeComplement}
        complements={currentProduct.complements}
      />
    </>
  );
}
