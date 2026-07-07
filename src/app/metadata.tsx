import type { Metadata, Viewport } from 'next';

export const metadataConfig: Metadata = {
    metadataBase: new URL('https://domiburguer.com'),
    // Título base y plantilla para páginas internas
    title: {
        default: 'Domi Burguer - ¡Pídela ya!',
        template: '%s | Domi Burguer',
    },
    applicationName: 'Domi Burguer',
    description:
        '¡Haz tu pedido de hamburguesas artesanales! Creamos nuestro propio sabor con ingredientes frescos y recetas familiares.',
    manifest: '/manifest.webmanifest', // Next servirá app/manifest.ts en esta URL
    icons: {
        icon: [
            { url: '/icono32x32.png', sizes: '72x72', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '96x96', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '128x128', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '144x144', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '152x152', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '192x192', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '384x384', type: 'image/png' },
            { url: '/icono32x32.png', sizes: '512x512', type: 'image/png' },
        ],
        // Opcional: atajos visuales (no equivalen a PWA shortcuts, esos van en el manifest)
        shortcut: [{ url: '/LogoMobile.png', sizes: '96x96', type: 'image/png' }],
    },
    openGraph: {
        title: 'Domi Burguer - ¡Pídela ya!',
        description:
            '¡Haz tu pedido de hamburguesas artesanales! Creamos nuestro propio sabor con ingredientes frescos y recetas familiares.',
        url: '/',
        siteName: 'Domi Burguer',
        locale: 'es_CO',
        type: 'website',
        images: [
            {
                url: '/soloPiensaEnDomi.jpg',
                width: 736,
                height: 920,
                alt: 'Domi Burguer - Hamburguesas artesanales'
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Domi Burguer - ¡Pídela ya!',
        description:
            '¡Haz tu pedido de hamburguesas artesanales! Creamos nuestro propio sabor con ingredientes frescos y recetas familiares.',
        images: ['/soloPiensaEnDomi.jpg'],
    },
};

export const viewportConfig: Viewport = {
    themeColor: '#e73533',
};
