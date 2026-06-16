"use client";

import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/utils/analytics";

interface AccountButtonProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
}

export const AccountButton = ({ isModalOpen, onOpenModal }: AccountButtonProps) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (user) {
      router.push("/profile");
    } else {
      track('login_modal_opened', { trigger: 'navbar_account_button' });
      onOpenModal();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="yellow"
      size="md"
      className={`rounded-full p-2  lg:h-12 lg:px-5 ${isModalOpen ? "bg-neutral-black-10" : ""}`}
    >
      {user && user.photoURL ? (
        <Avatar className="w-7 h-7 md:w-8 md:h-8">
          <AvatarImage
            src={user.photoURL}
            alt={user.displayName || "Usuario"}
          />
          <AvatarFallback>
            {user.displayName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
      )}
      <span className="text-neutrosblack-80 font-label text-xs md:text-sm">
        {user ? "CUENTA" : "REGISTRATE"}
      </span>

    </Button>

  );
};
