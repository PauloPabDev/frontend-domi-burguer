import cn from "clsx";
import { addToast } from "@heroui/toast";
import { Announcement } from "@/types/announcements";
import { AnnouncementCtaButton } from "./AnnouncementCta";
import { AnnouncementMarkdown } from "./AnnouncementMarkdown";
import { VARIANT_STYLES } from "./variants";

type ToastAnnouncement = Pick<Announcement, "variant" | "title" | "body" | "cta" | "dismissible">;

const TOAST_TIMEOUT_MS = 10_000;
// Con botón de acción se deja más tiempo para leerlo y pulsarlo
const TOAST_TIMEOUT_WITH_CTA_MS = 15_000;

export const showAnnouncementToast = (
  announcement: ToastAnnouncement,
  { onCtaClick }: { onCtaClick?: () => void } = {}
) => {
  const { variant, title, body, cta, dismissible } = announcement;
  const style = VARIANT_STYLES[variant];

  return addToast({
    classNames: {
      base: cn([
        "rounded-lg border-0 border-l-4 shadow-md bg-[#FEFBF8]",
        style.accent,
        "w-[343px] min-w-[343px] max-w-[343px] md:w-[440px] md:min-w-[440px] md:max-w-[440px]",
      ]),
      title: "font-bold text-[14px] md:text-[16px] text-[#333333]",
    },
    variant: "flat",
    hideIcon: true,
    hideCloseButton: !dismissible,
    title,
    description: <AnnouncementMarkdown content={body} compact />,
    timeout: cta ? TOAST_TIMEOUT_WITH_CTA_MS : TOAST_TIMEOUT_MS,
    endContent: cta ? <AnnouncementCtaButton cta={cta} onClick={onCtaClick} className="my-1" /> : undefined,
  });
};
