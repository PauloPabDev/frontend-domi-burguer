"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethod } from "@/types/paymentMethod";
import { track } from "@/utils/analytics";

interface PaymentMethodsSectionProps {
    paymentMethods: PaymentMethod[];
    selectedMethod: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentMethodsSection({
    paymentMethods,
    selectedMethod,
    onChange,
}: PaymentMethodsSectionProps) {
    return (
        <div className="flex flex-col gap-4 w-full">
            <h5 className="body-font font-bold">Método de pago</h5>

            <div className="flex flex-wrap justify-around gap-3 sm:gap-4 md:gap-5 w-full">
                {paymentMethods.map((method) => (
                    <PaymentMethodOption
                        key={method.id}
                        method={method}
                        isSelected={selectedMethod === method.id}
                        onChange={onChange}
                    />
                ))}
            </div>
        </div>
    );
}

interface PaymentMethodOptionProps {
    method: PaymentMethod;
    isSelected: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PaymentMethodOption({
    method,
    isSelected,
    onChange,
}: PaymentMethodOptionProps) {
    return (
        <label
            className={`cursor-pointer inline-flex flex-col items-start justify-center p-3 flex-[0_0_auto] rounded-[8px] transition-colors ${isSelected ? "bg-accent-yellow-10" : "bg-[#FFFFFF]"
                }`}
            onClick={() => {
                if (!isSelected) {
                    track('payment_method_selected', { method: method.id });
                }
            }}
        >
            <input
                type="radio"
                name="paymentMethod"
                id={method.id}
                value={method.id}
                checked={isSelected}
                onChange={onChange}
                className="hidden"
            />

            <div className="inline-flex items-center gap-4">
                <div
                    className={`relative w-4 h-4 rounded-[10px] ${isSelected
                        ? "bg-primary-red-60"
                        : "bg-[#FFFFFF] border-2 border-solid border-[#cccccc]"
                        }`}
                >
                    {isSelected && (
                        <div className="relative top-[calc(50.00%_-_3px)] left-[calc(50.00%_-_3px)] w-1.5 h-1.5 bg-[#FFFFFF] rounded-[10px]" />
                    )}
                </div>
                <div className="flex flex-col xl:flex-row xl:gap-2 items-center">
                    {method.logo ? (
                        <Image
                            src={method.logo}
                            alt={method.label}
                            width={32}
                            height={32}
                            className="object-contain rounded-sm"
                        />
                    ) : (
                        <method.icon className={method.iconClass} />
                    )}
                    <div
                        className={`w-fit font-normal text-xs text-center leading-[18px] whitespace-nowrap ${isSelected ? "text-neutral-black-80" : "text-neutral-black-50"
                            }`}
                    >
                        {method.label}
                    </div>
                </div>
            </div>
        </label>
    );
}