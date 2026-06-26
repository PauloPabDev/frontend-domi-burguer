import { Montserrat } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { Metadata, Viewport } from "next";
import { metadataConfig, viewportConfig } from "./metadata";
import Script from "next/script";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { GoogleSignInBanner } from "@/components/auth/GoogleSignInBanner";
import { headers } from "next/headers";
import { Suspense } from "react";
import { PromoCodeDetector } from "@/components/promo/PromoCodeDetector";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = metadataConfig;
export const viewport: Viewport = viewportConfig;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("next-url") ?? "";
  const isDesignRoute = pathname.startsWith("/design");
  const isCourierRoute = pathname.startsWith("/domiciliario");

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
      <body
        className={montserrat.variable}
      >
        <AuthProvider>
          {!isDesignRoute && !isCourierRoute && <Navbar />}
          <HeroUIProvider>
            <ToastProvider
              placement="top-right"
              toastOffset={100}
              maxVisibleToasts={10}
            />
            <Suspense fallback={null}>
              <PromoCodeDetector />
            </Suspense>
            {isDesignRoute || isCourierRoute ? (
              children
            ) : (
              <div className="container mx-auto overflow-x-hidden px-5 sm:px-10 md:px-10 lg:px-10 xl:px-16  max-w-[1440px] h-auto">
                {children}
              </div>
            )}
          </HeroUIProvider>
          {!isDesignRoute && !isCourierRoute && <Footer />}
          {!isDesignRoute && !isCourierRoute && <GoogleSignInBanner />}
        </AuthProvider>
        <Script
          defer
          src="https://umami.toxolinko.site/script.js"
          data-website-id="6449fca5-1454-49e0-8bdc-33fba01bcda4"
          strategy="afterInteractive"
        />
        {!isDesignRoute && !isCourierRoute && <InstallBanner />}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
