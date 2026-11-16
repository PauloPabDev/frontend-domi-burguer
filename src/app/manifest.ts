// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Domi Burguer - ¡Pídela ya!',
    short_name: 'Domi Burguer',
    lang: 'es',
    categories: ['food', 'lifestyle', 'shopping'],
    launch_handler: { client_mode: ['focus-existing', 'auto'] },
    description:
      '¡Haz tu pedido de hamburguesas artesanales! Creamos nuestro propio sabor con ingredientes frescos y recetas familiares.',
    orientation: 'portrait-primary',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#e73533', // fondo de la pantalla de arranque: el mismo rojo del icono
    theme_color: '#e73533',
    icons: [
      { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Hacer Pedido',
        short_name: 'Pedir',
        description: 'Haz tu pedido en Domi Burguer de manera rápida',
        url: '/#products',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Ver Carrito',
        short_name: 'Carrito',
        description: 'Revisa tu carrito de compras',
        url: '/cart',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
  };
}
