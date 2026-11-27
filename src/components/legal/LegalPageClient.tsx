"use client";

import { LogoMobile } from "@/components/ui/icons";
import { useEffect, useState, type ReactNode } from "react";

type TabType = "tos" | "privacy" | "referidos";

type LegalPageClientProps = {
    tosContent: ReactNode;
    privacyContent: ReactNode;
    referidosContent: ReactNode;
};

export default function LegalPageClient({
    tosContent,
    privacyContent,
    referidosContent,
}: LegalPageClientProps) {
    const [tab, setTab] = useState<TabType>("tos");

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#politicas") {
            setTab("privacy");
        } else if (hash === "#referidos") {
            setTab("referidos");
        } else {
            setTab("tos");
        }
    }, []);

    const tabs = [
        { id: "tos" as const, label: "TÉRMINOS DE SERVICIO", hash: "terminos" },
        { id: "privacy" as const, label: "POLÍTICAS DE PRIVACIDAD", hash: "politicas" },
        { id: "referidos" as const, label: "CÓDIGOS DE REFERIDOS", hash: "referidos" },
    ];

    return (
        <main className="min-h-screen w-full text-neutral-800">
            <header className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#FFF6E1] pb-10 pt-30 md:pt-40 px-5 sm:px-10 md:px-10 lg:px-10 xl:px-16 mb-2">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-full items-end justify-between">
                    <div className="max-w-[480px]">
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-4">
                            LEGAL
                        </h1>
                        <p className="body-font">
                            En Domi Burguer, creemos que la confianza también se cocina a fuego
                            lento. Por eso, esta página está hecha para contarte de forma
                            clara y sin rodeos cómo usamos tu información, qué derechos tienes
                            como usuario y bajo qué reglas jugamos.
                        </p>
                    </div>

                    <div className="ms-4">
                        <LogoMobile width={51} height={72} />
                    </div>
                </div>
            </header>

            <section className="mx-auto w-full max-w-6xl py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-4 space-y-3">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                    setTab(t.id);
                                    window.location.hash = t.hash;
                                }}
                                aria-pressed={tab === t.id}
                                className={[
                                    "w-[243px] rounded-full border px-5 py-3 text-left text-sm font-semibold transition",
                                    tab === t.id
                                        ? "text-neutral-black-80 border-neutral-900 shadow-sm"
                                        : "bg-white/60 text-neutral-800 border-neutral-300 hover:bg-white",
                                ].join(" ")}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="lg:col-span-8 xl:col-span-9">
                    <article className="rounded-2xl bg-white p-6 px-2">
                        <p className="text-xs font-semibold tracking-wide text-neutral-500 mb-4">
                            ÚLTIMA ACTUALIZACIÓN, 26 DE NOVIEMBRE DE 2026
                        </p>

                        {tab === "tos" && tosContent}
                        {tab === "privacy" && privacyContent}
                        {tab === "referidos" && referidosContent}
                    </article>
                </div>
            </section>
        </main>
    );
}
