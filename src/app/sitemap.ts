import type { MetadataRoute } from "next";

const BASE_URL = "https://domiburguer.com";

// Solo páginas públicas e indexables; las privadas están bloqueadas en public/robots.txt.
const PUBLIC_PATHS = ["", "/referidos", "/cobertura", "/horarios", "/locations", "/avisos", "/legal"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${BASE_URL}${path}` }));
}
