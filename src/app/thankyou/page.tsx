"use client";

import { Button } from "@/components/ui/button";
import { FrenchFriesIcon, HamburgerIcon } from "@/components/ui/icons";
import Image from "next/image";
import Link from "next/link";

export default function Thankyou() {
  return (
    <main className="flex-1 flex flex-col w-full items-center ">
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-0 max-w-[1440px] w-screen overflow-visible ">
        {/* Columna 1 */}
        <div className="flex flex-col items-start justify-center gap-2 max-w-[720px] w-full mx-auto relative">
          <div className="w-full aspect-[1/1] relative h-full">
            <Image
              src="/images/misc/order-thank-you.webp"
              alt={"Hamburguesa"}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1279px) 100vw, 720px"
            />
          </div>
        </div>

        {/* Columna 2 */}
        <div className="flex flex-col items-center justify-center gap-6 xlgap-14 p-[20px] py-[80px] xl:p-20 bg-accent-yellow-10 max-w-[720px] h-[371px] xl:h-[742px]  w-full mx-auto">
          <div className="flex flex-col w-full items-center gap-6 ">
            <div>
              <h1 className="text-center text-[24px]!">
                ¡GRACIAS POR TU COMPRA!
              </h1>
            </div>
            <h4 className="text-center">
              TU PEDIDO HA SIDO RECIBIDO Y ESTÁ SIENDO PROCESADO.
            </h4>
            <p className="text-center body-font max-w-[350px]">
              Te notificaremos cuando tu pedido esté en camino. Mientras tanto,
              puedes revisar los detalles del pedido o explorar otros productos.
            </p>
          </div>

          <div className="flex w-full max-w-[720px] items-center justify-center gap-6">
            <div>
              <h1 className="font-bold! text-[28px]! md:text-[32px]! leading-[30px]! md:leading-[28px]! "></h1>
            </div>
          </div>

          <div className="flex w-full max-w-[720px] items-center justify-center gap-6">
            <Link href={"/"}>
              <Button className="text-white rounded-[30px] flex items-center gap-2 text-[16px] w-[164px] h-[48px]">
                <HamburgerIcon className="w-6 h-6" />
                EXPLORAR
              </Button>
            </Link>
            <Link href={"/info-order"}>
              <Button
                variant="ghost"
                className="bg-accent-yellow-40 hover:bg-accent-yellow-60 active:bg-accent-yellow-60 rounded-[30px] flex items-center gap-2 text-[16px] w-[165px] h-[48px]"
              >
                <FrenchFriesIcon className="w-6 h-6" />
                MI PEDIDO
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
