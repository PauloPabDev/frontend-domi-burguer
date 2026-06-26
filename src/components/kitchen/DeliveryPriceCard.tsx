"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPinIcon } from "@/components/ui/icons";
import { Loader2 } from "lucide-react";

interface DeliveryPriceCardProps {
  price: string;
  isLoading?: boolean;
}

export const DeliveryPriceCard = ({ price, isLoading }: DeliveryPriceCardProps) => {
  return (
    <Card className="bg-[#F7F7F7] shadow-none h-[68px] rounded-2xl border-0">
      <CardContent className="px-6 py-6">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          <span className="flex-1 body-font">Valor domicilio aprox.</span>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="body-font font-bold">{price}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
