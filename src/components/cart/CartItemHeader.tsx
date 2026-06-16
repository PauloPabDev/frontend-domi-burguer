import { PencilIcon } from "lucide-react";
import { CartItem } from "@/store/cartStore";
import { track } from "@/utils/analytics";

interface CartItemHeaderProps {
    item: CartItem;
    onEditComplements: (item: CartItem) => void;
}

export const CartItemHeader = ({ item, onEditComplements }: CartItemHeaderProps) => {
    return (
        <div className="grid grid-cols-[1fr_auto] gap-x-2 w-full items-start">
            <div className="font-h4 leading-tight line-clamp-2 break-words">{item.name}</div>
            {item.allowCustomization ? (
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer bg-accent-yellow-100 hover:bg-accent-yellow-80 text-neutral-black-80 transition-colors rounded-full px-4 py-2 shadow-sm font-semibold"
                    onClick={() => {
                        track('cart_item_edit_opened', { item_name: item.name, item_id: item.id });
                        onEditComplements(item);
                    }}
                >
                    <span className="text-xs">Adiciones</span>
                    <PencilIcon className="w-3.5 h-3.5" />
                </button>
            ) : <span />}
        </div>
    );
};
