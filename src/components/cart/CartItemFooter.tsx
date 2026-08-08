import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/ui/quantitySelector";

interface CartItemFooterProps {
    id: string;
    price: number;
    quantity: number;
    rewardCode?: string;
    onDecrease: (id: string, quantity: number) => void;
    onIncrease: (id: string, quantity: number) => void;
    onRemoveReward?: () => void;
}

export const CartItemFooter = ({ id, price, quantity, rewardCode, onDecrease, onIncrease, onRemoveReward }: CartItemFooterProps) => {
    const isReward = !!rewardCode;

    return (
        <div className="flex h-8 items-center justify-between w-full gap-2 rounded-[50px]">
            <h4 className="min-w-0 truncate">
                {isReward ? (
                    <span className="text-green-600 font-bold">
                        GRATIS{price > 0 ? ` + $${price.toLocaleString("es-CO")}` : ""}
                    </span>
                ) : (
                    `$${price.toLocaleString("es-CO")} X ${quantity}`
                )}
            </h4>
            {isReward ? (
                <button
                    type="button"
                    aria-label="Eliminar premio"
                    onClick={onRemoveReward}
                    className="shrink-0 p-1 text-neutral-400 hover:text-primary-red transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            ) : (
                <div className="shrink-0">
                    <QuantitySelector
                        size="sm"
                        value={quantity}
                        onDecrease={() => onDecrease(id, quantity)}
                        onIncrease={() => onIncrease(id, quantity)}
                    />
                </div>
            )}
        </div>
    );
};
