import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGoogleReviews, type GoogleReview } from "@/lib/googleReviews";

const STAR_PATH = "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z";

const Stars = ({ value, className }: { value: number; className: string }) => (
  <svg
    role="img"
    aria-label={`${String(Math.round(value * 10) / 10).replace(".", ",")} de 5 estrellas`}
    viewBox="0 0 120 24"
    className={className}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} transform={`translate(${i * 24} 0)`} d={STAR_PATH} fill="currentColor" opacity={value >= i + 1 ? 1 : 0.35} />
    ))}
  </svg>
);

const Avatar = ({ review }: { review: GoogleReview }) =>
  review.photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto de Google, no vale la pena abrir remotePatterns
    <img src={review.photoUrl} alt="" referrerPolicy="no-referrer" className="size-10 shrink-0 rounded-full object-cover" />
  ) : (
    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-black-80 font-extrabold text-white">
      {review.author.charAt(0).toUpperCase()}
    </span>
  );

// Componente de servidor: pide las reseñas al compilar / revalidar y, si no hay datos, no pinta nada
export default async function GoogleReviewsSection() {
  const data = await getGoogleReviews();
  if (!data) return null;
  const { rating, total, mapsUrl, reviews } = data;

  return (
    <section aria-labelledby="reviews-title" className="w-full py-8 sm:py-14 lg:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col items-start gap-3">
          <span className="rounded-full bg-neutral-black-80 px-4 py-1 text-sm font-bold text-white">OPINIONES</span>
          <h2
            id="reviews-title"
            className="font-extrabold! text-primary-red! m-0! text-[40px]! leading-[42px]! lg:text-[56px]! lg:leading-[58px]!"
          >
            LA GENTE HABLA DE NOSOTROS
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 lg:gap-6">
          <div className="flex flex-col items-start gap-5 rounded-[28px] p-6 lg:justify-between lg:rounded-[32px] lg:p-8 bg-[linear-gradient(45deg,rgba(255,194,5,1)_0%,rgba(255,194,5,0.4)_100%)]">
            <div className="hidden lg:flex flex-col gap-1.5">
              <span className="text-sm font-bold">CALIFICACIÓN EN</span>
              <span className="text-2xl font-extrabold">Google Maps</span>
            </div>
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-2.5">
              <span className="text-[72px] leading-[72px] lg:text-[104px] lg:leading-[100px] font-extrabold tracking-tight">
                {rating.toFixed(1).replace(".", ",")}
              </span>
              <div className="flex flex-col gap-1.5">
                <Stars value={rating} className="h-6 w-[120px] lg:h-[30px] lg:w-[150px] text-neutral-black-80" />
                <span className="text-sm font-bold">
                  {total.toLocaleString("es-CO")} {total === 1 ? "reseña" : "reseñas"}
                  <span className="lg:hidden"> en Google Maps</span>
                </span>
              </div>
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "dark", size: "lg" }), "w-full lg:w-auto text-sm")}
              >
                VER TODAS EN GOOGLE MAPS →
              </a>
            )}
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0">
            {reviews.map((r, i) => (
              <article
                key={i}
                className="flex shrink-0 basis-[300px] snap-start flex-col justify-between gap-4 rounded-3xl bg-accent-yellow-10 p-5 lg:basis-auto lg:p-6"
              >
                <div className="flex flex-col gap-3">
                  <Stars value={r.rating} className="h-5 w-[100px] text-accent-yellow-100" />
                  <p className="m-0 line-clamp-5 text-[15px] leading-[22px] font-medium text-neutral-black-80 lg:line-clamp-4 lg:text-base lg:leading-6">
                    {r.text}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar review={r} />
                  <div className="flex min-w-0 grow flex-col gap-0.5">
                    <span className="truncate text-sm font-bold text-neutral-black-80">{r.author}</span>
                    <span className="text-[13px] leading-4 font-medium text-[#5E5E5E]">{r.when}</span>
                  </div>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver la reseña de ${r.author} en Google Maps`}
                      className="whitespace-nowrap text-[13px] font-bold text-neutral-black-80 hover:text-primary-red"
                    >
                      Ver reseña ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="m-0 max-w-[760px] text-xs leading-[18px] font-medium text-[#5E5E5E] lg:text-[13px] lg:leading-5">
          <strong className="text-neutral-black-80">Google Maps</strong> · Selección al azar de reseñas de 4 y 5 estrellas, entre las más relevantes que entrega
          Google. Google no verifica las reseñas, pero revisa y elimina las falsas cuando las detecta.
        </p>
      </div>
    </section>
  );
}
