import cn from "clsx";
import { addToast } from "@heroui/toast";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HamburgerIcon } from "./ui/icons";
import Link from "next/link";

export const showFoodToast = (productName: string) => {
  console.log(productName);
  return addToast({
    classNames: {
      base: cn([
        "p-0 overflow-visible",
        "border-none rounded-lg",
        "shadow-md bg-[#FEFBF8]",
        "animate-in slide-in-from-top-5 duration-300",
        " w-[343px] min-w-[343px] max-w-[343px] md:w-[440px] md:min-w-[440px] md:max-w-[440px] h-[112px] max-h-[120px] gap-x-0 mx-0 sm:mx-0",
        "transition-all duration-200 ",
        "group hover:z-50",
      ]),
      closeButton:
        "absolute top-1 right-1 md:top-2 md:right-2 z-50 visible opacity-100 visible",
      content: "hidden",
    },
    variant: "flat",
    hideIcon: true,
    title: "",
    description: "",
    timeout: 5000,
    endContent: (
      <div className="flex items-center p-2  w-[343px] min-w-[343px] max-w-[343px] md:w-[440px] md:min-w-[440px] md:max-w-[440px] max-h-[122px] min-h-[112px] bg-[#FEFBF8] overflow-visible rounded-lg">
        <div
          className={`relative w-[96px] h-[96px] border-0 overflow-visible bg-accent-yellow-40 rounded-[7.5px]`}
        >
          {productName === "COMBO ESPECIAL" && (
            <>
              <Image
                src="/images/products/burger-thumbnail.webp"
                alt="Burger"
                width={67}
                height={105}
                className="absolute top-[-5px] left-[5px] w-[67px] h-[105px] "
              />

              <Image
                src="/images/products/fries-thumbnail.webp"
                alt="Papas"
                width={56}
                height={85}
                className="absolute top-[18px] left-[40px] w-[56px] h-[85px] object-cover"
              />
            </>
          )}
          {productName === "HAMBURGUESA ARTESANAL" && (
            <Image
              src="/images/products/burger-thumbnail.webp"
              alt="Hamburguesa artesanal"
              width={67}
              height={105}
              className="absolute top-[-5px] left-[15px] w-[67px] h-[105px] object-cover"
            />
          )}
          {productName === "SALSA DE AJO" && (
            <Image
              src="/images/products/sauce-thumbnail.webp"
              alt="Salsa de ajo"
              width={118}
              height={85}
              className="absolute top-[5px] left-[3px] w-[118px] h-[85px] object-cover overflow-visible"
            />
          )}
          {productName === "PAPAS VAQUERA" && (
            <Image
              src="/images/products/vaquera-card.webp"
              alt="Papas Vaquera"
              width={67}
              height={105}
              className="absolute top-[-5px] left-[15px] w-[67px] h-[105px] object-cover"
            />
          )}
          {productName === "PAPAS TROYANA" && (
            <Image
              src="/images/products/troyana-card.webp"
              alt="Papas Troyana"
              width={67}
              height={105}
              className="absolute top-[-5px] left-[15px] w-[67px] h-[105px] object-cover"
            />
          )}

        </div>
        <div className="flex flex-col flex-grow ml-4 mt-2 overflow-visible">
          <h4 className="font-bold text-[14px] md:text-[16px] text-[#333333]">
            {productName}
          </h4>
          <p className="body-font">Producto añadido exitosamente</p>
          <div className="">
            <Link href={"/cart"}>
              <Button
                size="sm"
                className="rounded-[30px] text-white font-medium px-4 my-2 h-[32px]"
              >
                <HamburgerIcon className="w-4 h-4" />
                PAGAR AHORA
              </Button>
            </Link>
          </div>
        </div>
      </div>
    ),
  });
};
