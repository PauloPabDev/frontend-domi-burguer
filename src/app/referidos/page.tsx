import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SpikesIcon } from "@/components/ui/icons";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { metadataConfig } from "../metadata";

const TITLE = "Código de referido: cómo obtenerlo y usarlo";
const DESCRIPTION =
  "Aprende en 3 pasos cómo obtener, compartir y usar tu código de referido de Domi Burguer: papas gratis para tu amigo y Domi puntos para ti.";
const REEL_URL = "https://www.instagram.com/reel/DY26glGoal_/";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/referidos" },
  openGraph: { ...metadataConfig.openGraph, title: TITLE, description: DESCRIPTION, url: "/referidos" },
  twitter: { ...metadataConfig.twitter, title: TITLE, description: DESCRIPTION },
};

const steps = [
  {
    name: "Obtén tu código",
    text: "Haz al menos un pedido en domiburguer.com con tu cuenta de Google y tu número de celular verificado. Después entra a «Códigos» y crea tu código: de 3 a 12 letras o números. Elígelo bien, porque es único y no se puede cambiar.",
    link: { href: "/codes", label: "Crear mi código" },
  },
  {
    name: "Compártelo",
    text: "Desde tu perfil toca «Compartir» para enviar tu enlace personal o mostrar su código QR. Compártelo con personas que nunca hayan pedido en la página web de Domi Burguer.",
    link: { href: "/profile", label: "Ir a mi perfil" },
  },
  {
    name: "Tu amigo lo usa en su primer pedido",
    text: "Tu amigo se registra en domiburguer.com, verifica su celular, arma su pedido y en el carrito escribe tu código en «Código de referido». Si entró por tu enlace, el código ya queda guardado. ¡Listo! Papas gratis para tu amigo y 65 Domi puntos para ti.",
    link: { href: "/", label: "Ver el menú" },
  },
];

const conditions = [
  "El código solo funciona en la primera compra de un cliente nuevo.",
  "Solo aplica para pedidos hechos en domiburguer.com; no aplica por WhatsApp, llamadas ni de forma presencial.",
  "El beneficio no es acumulable con otras promociones ni se puede cambiar por dinero.",
  "Cada persona puede crear un único código de referido.",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Cómo obtener y usar el código de referido de Domi Burguer",
  description: DESCRIPTION,
  inLanguage: "es-CO",
  step: steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
};

export default function ReferidosPage() {
  return (
    <main className="mt-[130px] min-h-[60vh] pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <header className="text-center flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-yellow-40">
            <Gift className="w-7 h-7 text-primary-red" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Código de referido de Domi Burguer
          </h1>
          <p className="text-neutral-black-60 leading-relaxed">
            Invita a tus amigos: ellos reciben una porción de <strong>papas GRATIS</strong> en su primer pedido y tú
            ganas <strong>65 Domi puntos</strong> por cada uno. Con 199 Domi puntos te regalamos un combo.
          </p>
        </header>

        <section aria-labelledby="pasos">
          <SpikesIcon className="w-full" />
          <div className="bg-accent-yellow-10 px-6 py-6 flex flex-col gap-5">
            <h2 id="pasos" className="font-bold text-xl text-neutral-black-80">
              Cómo funciona en 3 pasos
            </h2>
            <ol className="flex flex-col gap-6">
              {steps.map((step, index) => (
                <li key={step.name} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold"
                  >
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-neutral-black-80">{step.name}</h3>
                    <p className="text-sm leading-relaxed text-neutral-black-60">{step.text}</p>
                    <Link
                      href={step.link.href}
                      data-umami-event="referidos_step_link_clicked"
                      data-umami-event-step={index + 1}
                      className="inline-flex items-center gap-1 w-fit text-sm font-semibold text-primary-red underline"
                    >
                      {step.link.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <SpikesIcon className="w-full rotate-180" />
        </section>

        <section aria-labelledby="video" className="flex flex-col gap-4">
          <h2 id="video" className="font-bold text-xl text-neutral-black-80 text-center">
            Míralo en video
          </h2>
          <InstagramEmbed permalink={REEL_URL} label="Ver el video del código de referido en Instagram" />
        </section>

        <section aria-labelledby="condiciones" className="flex flex-col gap-3">
          <h2 id="condiciones" className="font-bold text-xl text-neutral-black-80">
            Ten en cuenta
          </h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-sm leading-relaxed text-neutral-black-60">
            {conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
          <p className="text-sm text-neutral-black-60">
            Consulta los{" "}
            <Link href="/legal#referidos" className="underline font-semibold">
              términos y condiciones del programa de referidos
            </Link>
            .
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/codes"
            data-umami-event="referidos_create_code_clicked"
            className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}
          >
            Crear mi código
          </Link>
          <Link
            href="/"
            data-umami-event="referidos_menu_clicked"
            className={buttonVariants({ variant: "outline", size: "lg", fullWidth: true })}
          >
            Ver el menú
          </Link>
        </div>
      </div>
    </main>
  );
}
