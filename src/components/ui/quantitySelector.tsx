import { Minus, Plus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const quantityWrapperVariants = cva(
  "flex items-center justify-center border rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 gap-2 px-[3px] py-2 border-[1.2px] border-[#313131] max-w-[90px] w-fit",
        lg: "h-[48px] gap-6 px-1.5 py-2",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export interface QuantitySelectorProps
  extends VariantProps<typeof quantityWrapperVariants> {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function QuantitySelector({
  value,
  onIncrease,
  onDecrease,
  size,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        quantityWrapperVariants({ size }),
        size === "lg" && (value < 10 ? "w-[142px]" : "w-[153px]"),
      )}
    >
      <Button
        type="button"
        variant="yellow"
        size={size === "sm" ? "icon-sm" : "icon"}
        onClick={onDecrease}
        className={cn(size === "sm" && "w-[24px] h-[24px]", size === "lg" && "w-[38px] h-[38px]")}
      >
        <Minus
          className={cn(size === "sm" ? "w-[16px] h-[16px]" : "w-5 h-5")}
        />
      </Button>

      <span
        className={cn(
          "font-bold text-neutrosblack-80 tracking-[0] whitespace-nowrap",
          size === "sm"
            ? "text-xs leading-[18px] font-montserrat"
            : "label-font text-base",
        )}
      >
        {size === "sm" ? String(value).padStart(2, "0") : value}
      </span>

      <Button
        type="button"
        variant="yellow"
        size={size === "sm" ? "icon-sm" : "icon"}
        onClick={onIncrease}
        className={cn(size === "sm" && "w-[24px] h-[24px]", size === "lg" && "w-[38px] h-[38px]")}
      >
        <Plus className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
      </Button>
    </div>
  );
}
