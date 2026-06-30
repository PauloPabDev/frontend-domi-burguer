"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GoogleSignInBanner } from "@/components/auth/GoogleSignInBanner";
import { InstallBanner } from "@/components/pwa/InstallBanner";

const DESIGN_PREFIX = "/design";
const COURIER_PREFIXES = ["/domiciliario", "/cocina", "/recepcion", "/admin"];

function isDesignRoute(pathname: string) {
  return pathname.startsWith(DESIGN_PREFIX);
}

function isCourierRoute(pathname: string) {
  return COURIER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDesign = isDesignRoute(pathname);
  const isCourier = isCourierRoute(pathname);
  const showPublicChrome = !isDesign && !isCourier;

  return (
    <>
      {showPublicChrome && <Navbar />}
      {isDesign || isCourier ? (
        children
      ) : (
        <div className="container mx-auto overflow-x-hidden px-5 sm:px-10 md:px-10 lg:px-10 xl:px-16 max-w-[1440px] h-auto">
          {children}
        </div>
      )}
      {showPublicChrome && <Footer />}
      {showPublicChrome && <GoogleSignInBanner />}
      {showPublicChrome && <InstallBanner />}
    </>
  );
}
