"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoreStatusBar } from "@/components/home/StoreStatusBar";

export default function HorariosPage() {
    return (
        <main className="min-h-screen w-full text-neutral-800">
            <section className="mx-auto w-full max-w-6xl py-12 px-4 sm:px-6 lg:px-8 mt-10">
                <article className="rounded-2xl bg-white p-8 text-center">
                    <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-6">
                        HORARIOS
                    </h2>

                    <StoreStatusBar />

                    <p className="text-xl text-neutral-700 leading-relaxed mb-4">
                        Nuestro servicio es de lunes a sábado de 4:30 p.m a 10:00 p.m
                    </p>

                    <p className="text-lg text-neutral-600 mb-8">
                        Los domingos es nuestro día de descanso 😊✨
                    </p>

                    <div className="flex justify-center">
                        <Button
                            size={"lg"}
                            variant="outline"
                            className="inline-flex h-10 lg:h-12 justify-center px-[10px] lg:px-5 lg:py-2 rounded-[30px] items-center bg-transparent"
                        >
                            <Link href="/">
                                ir a comprar
                            </Link>
                        </Button>
                    </div>
                </article>
            </section>
        </main>
    );
}
