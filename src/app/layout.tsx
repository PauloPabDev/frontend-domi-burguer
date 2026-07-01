import { Montserrat } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { Metadata, Viewport } from "next";
import { metadataConfig, viewportConfig } from "./metadata";
import Script from "next/script";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Suspense } from "react";
import { PromoCodeDetector } from "@/components/promo/PromoCodeDetector";
import { LayoutShell } from "@/components/LayoutShell";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = metadataConfig;
export const viewport: Viewport = viewportConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-title" content="Domi Burguer" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      </head>
      <body className={montserrat.variable}>
        <AuthProvider>
          <ProductsProvider>
          <HeroUIProvider>
            <ToastProvider
              placement="top-right"
              toastOffset={100}
              maxVisibleToasts={10}
            />
            <Suspense fallback={null}>
              <PromoCodeDetector />
            </Suspense>
            <LayoutShell>{children}</LayoutShell>
          </HeroUIProvider>
          </ProductsProvider>
        </AuthProvider>
        <Script
          defer
          src="https://umami.toxolinko.site/script.js"
          data-website-id="6449fca5-1454-49e0-8bdc-33fba01bcda4"
          strategy="afterInteractive"
        />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
