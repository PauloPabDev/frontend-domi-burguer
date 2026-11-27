"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnnouncementsHost } from "@/components/announcements/AnnouncementsHost";
import { StoreStatusAlert } from "@/components/announcements/StoreStatusAlert";
import { PromptHost } from "@/components/prompts/PromptHost";
import { ClarityLoader } from "@/components/consent/ClarityLoader";
import { ClientSocketProvider } from "@/contexts/ClientSocketContext";
import { USING_MOCK_PRICES } from "@/data/products";

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

  const content = (
    <>
      {showPublicChrome && <Navbar />}
      {isDesign || isCourier ? (
        children
      ) : (
        <div className="container mx-auto overflow-x-hidden px-5 sm:px-10 md:px-10 lg:px-10 xl:px-16 max-w-[1440px] h-auto">
          {children}
        </div>
      )}
      {showPublicChrome && (
        <>
          <Footer />
          {/* Relleno rojo bajo el footer para que el dock móvil no tape el contenido; las olas de arriba son transparentes y no deben quedar sobre rojo */}
          <div className="h-28 bg-primary-red lg:hidden" />
        </>
      )}
      {showPublicChrome && <PromptHost />}
      {showPublicChrome && <ClarityLoader />}
      {showPublicChrome && <AnnouncementsHost />}
      {showPublicChrome && <StoreStatusAlert />}
      {USING_MOCK_PRICES && (
        <div role="status" className="pointer-events-none fixed bottom-2 left-2 z-[9999] rounded-md bg-yellow-300 px-2 py-1 text-xs font-semibold text-black shadow">
          Usando datos de prueba
        </div>
      )}
    </>
  );

  return showPublicChrome ? (
    <ClientSocketProvider>{content}</ClientSocketProvider>
  ) : (
    content
  );
}
