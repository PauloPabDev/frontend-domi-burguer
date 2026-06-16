"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/utils/analytics";

export function ProfileHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            track('logout_clicked');
            await logout();
            router.push("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const getUserFirstName = () => {
        if (user?.displayName) {
            return user.displayName.split(" ")[0].toUpperCase();
        }
        return "USUARIO";
    };

    if (!user) return null;

    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">
                    HOLA {getUserFirstName()}
                </h1>
                {user.email && (
                    <p className="text-neutral-500 text-sm mt-1">{user.email}</p>
                )}
            </div>
            <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                size="sm"
                className="text-neutral-500 hover:text-primary-red hover:bg-red-50"
            >
                {isLoggingOut ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <>
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                    </>
                )}
            </Button>
        </div>
    );
}
