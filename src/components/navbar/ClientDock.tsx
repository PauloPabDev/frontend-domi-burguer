"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { House, ReceiptText, UserIcon } from "lucide-react";
import { LogoMobile } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { track } from "@/utils/analytics";
import { readCachedAccount } from "@/utils/cachedAccount";

const LogInModal = dynamic(
  () => import("../login/logInModal").then((mod) => mod.LogInModal),
  { ssr: false },
);

const itemClass =
  "flex h-14 min-w-0 max-w-16 flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-3xl text-[11px] font-semibold text-[#666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50";
const activeClass = "bg-[#fff3cd] font-extrabold text-[#cf2b29]";

// Se adapta al número: 120 · 2.450 · 12,5 k · 1,2 M
const formatPoints = (n: number) => {
  if (n < 10000) return n.toLocaleString("es-CO");
  const short = (v: number, unit: string) => `${v.toFixed(1).replace(".", ",").replace(",0", "")} ${unit}`;
  return n < 1_000_000 ? short(n / 1000, "k") : short(n / 1_000_000, "M");
};

/**
 * Barra inferior del cliente en móvil y tablet: Mi cuenta · Pedir (logo) · Mi pedido · Inicio.
 * Pedir ocupa un centro fijo entre dos mitades iguales, así queda centrado aunque un lado tenga más opciones.
 */
export const ClientDock = ({ balance }: { balance: number | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const isPedir = pathname.startsWith("/cart");
  const isPedido = pathname.startsWith("/orders");
  const isInicio = pathname === "/";
  const isCuenta = isAccountModalOpen || pathname.startsWith("/profile");

  const handleAccount = () => {
    // Mientras Firebase resuelve la sesión, el último usuario conocido decide a dónde ir
    if (user || (loading && readCachedAccount())) {
      router.push("/profile");
    } else {
      track("login_modal_opened", { trigger: "navbar_account_button" });
      setIsAccountModalOpen(true);
    }
  };

  // Foto y etiqueta de la cuenta se alternan por CSS según <html data-account> (ver globals.css),
  // así el estado correcto se ve desde el primer pintado, sin esperar a React.
  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-2.5 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-[72px] max-w-[520px] items-center gap-1 rounded-[30px] border border-neutral-black-20 bg-white px-1.5 shadow-lg lg:hidden"
      >
        <div className="flex min-w-0 flex-1 justify-center">
          <button
            type="button"
            onClick={handleAccount}
            aria-current={isCuenta ? "page" : undefined}
            aria-label={balance === null ? undefined : `Mi cuenta, tienes ${formatPoints(balance)} puntos`}
            className={cn(itemClass, "relative w-full", isCuenta && activeClass)}
          >
            {balance !== null && (
              <span
                aria-hidden
                className="absolute -top-[22px] left-1/2 flex min-h-6 min-w-6 -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full border-2 border-white bg-[#ffe79b] px-2.5 py-1 text-xs font-extrabold leading-none text-[#313131] shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
              >
                {formatPoints(balance)} PT
              </span>
            )}
            <span className="flex h-[26px] items-center">
              <UserIcon className="dock-user-icon size-[22px]" />
              <span
                aria-hidden
                className="dock-avatar size-[26px] rounded-full bg-primary-red bg-cover bg-center"
                style={{ backgroundImage: "var(--account-photo)" }}
              />
            </span>
            <span>
              <span className="acc-guest-label">Registrarse</span>
              <span className="acc-user-label">Mi cuenta</span>
            </span>
          </button>
        </div>

        <Link
          href="/cart"
          aria-current={isPedir ? "page" : undefined}
          className="relative flex h-full w-[88px] shrink-0 items-end justify-center pb-[9px] text-xs font-extrabold text-[#cf2b29] focus-visible:outline-none"
        >
          <span
            aria-hidden
            className={cn(
              "absolute -top-[34px] left-1/2 flex size-[72px] -translate-x-1/2 items-center justify-center rounded-full border border-neutral-black-20 bg-white shadow-[0_8px_16px_rgba(0,0,0,0.12)]",
              isPedir && "ring-[3px] ring-[#ffe79b]",
            )}
          >
            <LogoMobile width={34} height={48} />
          </span>
          Pedir
        </Link>

        <div className="flex min-w-0 flex-1 justify-center gap-0.5">
          <Link
            href="/orders"
            aria-current={isPedido ? "page" : undefined}
            className={cn(itemClass, isPedido && activeClass)}
          >
            <span className="flex h-[26px] items-center">
              <ReceiptText className="size-[22px]" />
            </span>
            <span>Mi pedido</span>
          </Link>
          <Link
            href="/"
            aria-current={isInicio ? "page" : undefined}
            className={cn(itemClass, isInicio && activeClass)}
          >
            <span className="flex h-[26px] items-center">
              <House className="size-[22px]" />
            </span>
            <span>Inicio</span>
          </Link>
        </div>
      </nav>

      <LogInModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
};
