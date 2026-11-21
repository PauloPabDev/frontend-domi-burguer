"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AccountButton } from "./navbar/AccountButton";
import { ClientDock } from "./navbar/ClientDock";
import { NavLogo } from "./navbar/NavLogo";
import { OrderButton } from "./navbar/OrderButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const LogInModal = dynamic(
  () => import("./login/logInModal").then((mod) => mod.LogInModal),
  { ssr: false },
);

export const Navbar = () => {
  const [isAccountModalOpen, setIsAcountModalOpen] = useState(false);
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const balance = user && userProfile ? (userProfile.pointsBalance ?? 0) : null;

  return (
    <>
      <ClientDock balance={balance} />

      <nav className="fixed top-0 left-0 z-300 hidden w-full px-4 lg:block">
        <div className="max-w-[828px] md:h-[80px] h-[62px] gap-2 py-0 mt-[20px] mb-[10px] rounded-[60px] border border-solid border-[#e6e6e6] flex items-center justify-between w-full mx-auto px-4! sm:px-6 lg:px-8 bg-[#ffffff]">
          <div className="flex w-[300px] h-14 px-0 py-3 rounded-[50px] overflow-hidden items-center">
            <AccountButton
              isModalOpen={isAccountModalOpen}
              onOpenModal={() => setIsAcountModalOpen(true)}
            />
          </div>

          <NavLogo />

          <OrderButton balance={balance} />
        </div>
      </nav>

      <LogInModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAcountModalOpen(false)}
      />
    </>
  );
};
