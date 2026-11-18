import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HamburgerIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

export const OrderButton = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const balance = user && userProfile ? (userProfile.pointsBalance ?? 0) : null;

  return (
    <div className="w-[300px] items-center flex justify-end gap-2">
      <Link
        href={"/cart"}
        tabIndex={-1}
        className="focus:outline-0! focus:ring-0! focus:bg-[#E10300] rounded-full"
      >
        <Button
          variant="primary"
          size="md"
          leftIcon={
            <HamburgerIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          }
          badge={balance === null ? undefined : `${balance} PT`}
          aria-label={balance === null ? "Ordenar" : `Ordenar, tienes ${balance} puntos`}
          className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
        >
          ORDENAR
        </Button>
      </Link>
    </div>
  );
};
