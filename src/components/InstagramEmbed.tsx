"use client";

import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramEmbed({ permalink, label }: { permalink: string; label: string }) {
  return (
    // El div envuelve el blockquote porque embed.js lo reemplaza por un iframe y React no debe desmontar ese nodo directamente.
    <div className="w-full max-w-[540px] mx-auto">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{ width: "100%", minWidth: 0, margin: 0 }}
      >
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="referidos_video_clicked"
          className="block rounded-2xl border border-accent-yellow-40 bg-white px-6 py-10 text-center font-semibold text-primary-red underline"
        >
          {label}
        </a>
      </blockquote>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        // onReady también corre al volver a la página por navegación interna, cuando el script ya está cargado.
        onReady={() => window.instgrm?.Embeds.process()}
      />
    </div>
  );
}
