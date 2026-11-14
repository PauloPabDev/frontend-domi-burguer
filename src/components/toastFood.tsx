import cn from "clsx";
import { addToast } from "@heroui/toast";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./ui/ProductImage";
import { HamburgerIcon } from "./ui/icons";
import Link from "next/link";

export const showFoodToast = ({ name, image1 }: { name: string; image1: string }) => {
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
        <ProductImage src={image1} alt={name} />
        <div className="flex flex-col flex-grow ml-4 mt-2 overflow-visible">
          <h4 className="font-bold text-[14px] md:text-[16px] text-[#333333]">
            {name}
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
