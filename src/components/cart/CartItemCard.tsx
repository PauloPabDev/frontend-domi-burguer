"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CartItem } from "@/store/cartStore";
import { Complements } from "@/components/ui/complements";
import { CartItemImage } from "@/components/cart/CartItemImage";
import { CartItemHeader } from "@/components/cart/CartItemHeader";
import { CartItemFooter } from "@/components/cart/CartItemFooter";

interface CartItemCardProps {
    item: CartItem;
    onEditComplements: (item: CartItem) => void;
    onRemoveComplement: (itemId: string, complementId: number | string) => void;
    onDecrease: (id: string, quantity: number) => void;
    onIncrease: (id: string, quantity: number) => void;
    onRemoveReward: (id: string, name: string, rewardCode: string) => void;
}

export const CartItemCard = ({
    item,
    onEditComplements,
    onRemoveComplement,
    onDecrease,
    onIncrease,
    onRemoveReward,
}: CartItemCardProps) => {
    return (
        <Card className="flex w-full xl:h-28 items-start gap-4 pl-2 pr-3 xl:pr-4 py-2 bg-[#FFFFFF] rounded-[12px] overflow-hidden border-0">
            <CardContent className="p-0 flex w-full gap-4 items-center justify-start">
                <CartItemImage
                    name={item.name}
                    image1={item.image1}
                    image2={item.image2}
                />

                <div className="justify-center w-full max-w-[316px] gap-2 xl:gap-3 pt-1 pb-0 px-0 flex-1 grow flex flex-col items-start self-stretch">
                    <CartItemHeader
                        item={item}
                        onEditComplements={onEditComplements}
                    />

                    <Complements
                        complements={item.complements}
                        onRemove={(complementId) =>
                            onRemoveComplement(item.id, complementId)
                        }
                    />

                    <CartItemFooter
                        id={item.id}
                        price={item.price}
                        quantity={item.quantity}
                        rewardCode={item.rewardCode}
                        onDecrease={onDecrease}
                        onIncrease={onIncrease}
                        onRemoveReward={item.rewardCode
                            ? () => onRemoveReward(item.id, item.name, item.rewardCode!)
                            : undefined}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
