// Solo servidor: las variables sin prefijo NEXT_PUBLIC_ no llegan al navegador, así que la clave nunca se expone.
// Variables: GOOGLE_PLACES_API_KEY (clave) y GOOGLE_PLACE_IDS (Place IDs de las sedes, separados por coma).

export interface GoogleReview {
  author: string;
  photoUrl?: string;
  rating: number;
  text: string;
  when: string;
  url?: string;
}

export interface GoogleReviewsData {
  rating: number;
  total: number;
  mapsUrl?: string;
  reviews: GoogleReview[];
}

interface ApiReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  googleMapsUri?: string;
}

interface ApiPlace {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: ApiReview[];
}

const MAX_REVIEWS = 4;
const REVALIDATE_SECONDS = 60 * 60 * 24; // se vuelven a pedir como máximo una vez al día

// Datos de ejemplo solo para desarrollo, cuando no hay clave configurada
const DEV_MOCK: GoogleReviewsData = {
  rating: 4.8,
  total: 120,
  mapsUrl: "https://www.google.com/maps",
  reviews: [
    { author: "Cliente de ejemplo", rating: 5, when: "hace 2 semanas", url: "https://www.google.com/maps", text: "Reseña de ejemplo (mock de desarrollo). Así se ve una reseña larga: se corta a cuatro líneas en escritorio y el enlace «Ver reseña» lleva al texto completo en Google Maps." },
    { author: "Otra persona", rating: 5, when: "hace 1 mes", url: "https://www.google.com/maps", text: "Reseña corta de ejemplo." },
    { author: "Tercer cliente", rating: 4, when: "hace 3 meses", url: "https://www.google.com/maps", text: "Reseña de largo medio, para ver cómo se acomodan dos o tres líneas dentro de la tarjeta sin que quede un hueco raro abajo." },
    { author: "Cuarta persona", rating: 5, when: "hace 5 días", url: "https://www.google.com/maps", text: "Otra reseña de ejemplo. Las tarjetas de una misma fila se estiran a la misma altura y el autor siempre queda abajo." },
  ],
};

const fetchPlace = async (placeId: string, apiKey: string): Promise<ApiPlace> => {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Places API respondió ${res.status}: ${await res.text()}`);
  return res.json();
};

/** Devuelve null si no hay datos o si falla la consulta: la sección simplemente no se muestra y la página sigue compilando. */
export const getGoogleReviews = async (): Promise<GoogleReviewsData | null> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeIds = (process.env.GOOGLE_PLACE_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);

  if (!apiKey || placeIds.length === 0) {
    if (process.env.NODE_ENV === "development") return DEV_MOCK;
    console.warn("[reseñas] Falta GOOGLE_PLACES_API_KEY o GOOGLE_PLACE_IDS: la sección de reseñas no se muestra.");
    return null;
  }

  try {
    const places = await Promise.all(placeIds.map((id) => fetchPlace(id, apiKey)));

    const total = places.reduce((sum, p) => sum + (p.userRatingCount ?? 0), 0);
    if (total === 0) return null;
    // Promedio ponderado por la cantidad de reseñas de cada sede
    const rating = places.reduce((sum, p) => sum + (p.rating ?? 0) * (p.userRatingCount ?? 0), 0) / total;

    const reviews = places
      .flatMap((p) => p.reviews ?? [])
      .map((r): GoogleReview => ({
        author: r.authorAttribution?.displayName ?? "Cliente de Google",
        photoUrl: r.authorAttribution?.photoUri,
        rating: r.rating ?? 0,
        // Se prefiere el texto original: el traducido no es lo que escribió el cliente
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        when: r.relativePublishTimeDescription ?? "",
        url: r.googleMapsUri,
      }))
      .filter((r) => r.rating >= 4 && r.text)
      .sort(() => Math.random() - 0.5) // shortcut: mezcla sesgada, basta para escoger 4 de unas 10 reseñas
      .slice(0, MAX_REVIEWS);

    if (reviews.length === 0) return null;
    return { rating, total, mapsUrl: places[0]?.googleMapsUri, reviews };
  } catch (error) {
    console.error("[reseñas] No se pudieron cargar las reseñas de Google:", error);
    return null;
  }
};
