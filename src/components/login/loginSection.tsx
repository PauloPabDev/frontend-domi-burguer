"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { GoogleLogin } from "./googleLogin";
import { Card, CardContent } from "@/components/ui/card";

interface LoginSectionProps {
    onClose: () => void;
    redirectTo?: string;
    title?: string;
}

export const LoginSection = ({ onClose, redirectTo = "/profile", title }: LoginSectionProps) => {
    useEffect(() => {
        auth.languageCode = "es";
    }, []);

    return (
        <div className="flex flex-col w-full h-full justify-center items-center px-5 md:px-0">
            <Card className="w-full max-w-[500px] bg-white rounded-[30px] shadow-lg border-0">
                <CardContent className="flex flex-col gap-6 p-6 md:p-10">
                    {/* Encabezado */}
                    <div className="flex flex-col gap-2 items-center text-center">
                        <h2 className="font-bold text-[20px] md:text-[24px] leading-[22px] md:leading-[26px] text-neutral-black-80 uppercase">
                            {title ?? "Inicia sesión"}
                        </h2>
                        <p className="body-font text-neutral-black-50">
                            Ingresa con tu cuenta de Google para continuar.
                        </p>
                    </div>

                    {/* Separador */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-neutral-black-20" />
                        <span className="text-sm text-neutral-black-50">Ingresa con</span>
                        <div className="flex-1 h-[1px] bg-neutral-black-20" />
                    </div>

                    {/* Botón de Google */}
                    <GoogleLogin
                        onClose={onClose}
                        redirectTo={redirectTo}
                        variant="outline"
                    />
                </CardContent>
            </Card>
        </div>
    );
};