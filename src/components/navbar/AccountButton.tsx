"use client";

import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/utils/analytics";
import { readCachedAccount } from "@/utils/cachedAccount";

interface AccountButtonProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
}

export const AccountButton = ({ isModalOpen, onOpenModal }: AccountButtonProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    // Mientras Firebase resuelve la sesión, el último usuario conocido decide a dónde ir
    if (user || (loading && readCachedAccount())) {
      router.push("/profile");
    } else {
      track('login_modal_opened', { trigger: 'navbar_account_button' });
      onOpenModal();
    }
  };

  // Icono/foto y etiqueta se alternan por CSS según <html data-account> (ver globals.css),
  // así el estado correcto se ve desde el primer pintado, sin esperar a React.
  return (
    <Button
      onClick={handleClick}
      variant="yellow"
      size="md"
      className={`rounded-full p-2  lg:h-12 lg:px-5 ${isModalOpen ? "bg-neutral-black-10" : ""}`}
    >
      <UserIcon className="acc-icon w-5 h-5 md:w-6 md:h-6" />
      <span
        aria-hidden
        className="acc-photo w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full bg-primary-red bg-cover bg-center"
        style={{ backgroundImage: "var(--account-photo)" }}
      />
      <span className="text-neutrosblack-80 font-label text-xs md:text-sm">
        <span className="acc-guest-label">REGISTRATE</span>
        <span className="acc-user-label">CUENTA</span>
      </span>
    </Button>
  );
};
