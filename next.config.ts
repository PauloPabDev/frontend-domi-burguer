import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },

  // Optimizar paquetes externos (tree-shaking agresivo)
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@heroui/system",
      "@heroui/theme",
      "@heroui/toast",
      "framer-motion",
      "react-phone-number-input",
    ],
  },

  // Desactivar source maps en producción
  productionBrowserSourceMaps: false,
};

export default withSerwist(nextConfig);
