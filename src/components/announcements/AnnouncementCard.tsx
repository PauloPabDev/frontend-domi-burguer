"use client";

import { cn } from "@/lib/utils";
import { Announcement } from "@/types/announcements";
import { AnnouncementCtaButton } from "./AnnouncementCta";
import { AnnouncementMarkdown } from "./AnnouncementMarkdown";
// import { VARIANT_STYLES } from "./variants";

interface AnnouncementCardProps {
  announcement: Pick<Announcement, "variant" | "title" | "body" | "imageUrl" | "cta">;
  onCtaClick?: () => void;
  className?: string;
}

/** Aviso completo en formato tarjeta: la página /avisos y la vista previa del admin. */
export function AnnouncementCard({ announcement, onCtaClick, className }: AnnouncementCardProps) {
  const { title, body, imageUrl, cta } = announcement;
  // const style = VARIANT_STYLES[announcement.variant];

  return (
    <article className={cn("rounded-2xl border border-neutral-black-20 bg-white overflow-hidden shadow-sm", className)}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="w-full max-h-64 object-cover" />
      )}
      <div className="p-5 flex flex-col gap-3">
        {/* <span
          className={cn(
            "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold",
            style.badge
          )}
        >
          <style.Icon className="w-3.5 h-3.5" />
          {style.label}
        </span> */}
        <h2 className="text-lg font-extrabold text-neutral-900">{title}</h2>
        <AnnouncementMarkdown content={body} />
        {cta && <AnnouncementCtaButton cta={cta} onClick={onCtaClick} className="self-start" />}
      </div>
    </article>
  );
}
