"use client";

import { Modal } from "@/components/ui/modal";
import { Announcement } from "@/types/announcements";
import { AnnouncementMarkdown } from "./AnnouncementMarkdown";
import { VARIANT_STYLES } from "./variants";

interface AnnouncementModalProps {
  announcement: Pick<Announcement, "variant" | "title" | "body" | "imageUrl" | "cta" | "dismissible">;
  open: boolean;
  /** Se llama al cerrarlo por cualquier vía (botón, X, fuera del modal o Escape). */
  onClose: () => void;
  /** Se llama al pulsar el botón de acción; el modal se cierra después. */
  onCta?: () => void;
}

export function AnnouncementModal({ announcement, open, onClose, onCta }: AnnouncementModalProps) {
  const { variant, title, body, imageUrl, cta, dismissible } = announcement;
  const style = VARIANT_STYLES[variant];

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
      headerIcon={<style.Icon className={`h-8 w-8 ${style.icon}`} />}
      size="md"
      // Si no se puede descartar, solo se cierra con el botón del pie
      hideCloseButton={!dismissible}
      closeOnOutsideClick={dismissible}
      closeOnEscape={dismissible}
      enableDragToDismiss={dismissible}
      // El botón de acción navega: el manejo del "atrás" del modal haría un history.back() al cerrarlo
      handleBackButton={false}
      footer={{
        alignment: "center",
        cancel: cta && dismissible ? { label: "CERRAR" } : false,
        confirm: cta
          ? { label: cta.label.toUpperCase(), onClick: onCta }
          : { label: "ENTENDIDO", onClick: onClose },
      }}
    >
      <div className="flex flex-col gap-4">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-full max-h-56 rounded-xl object-cover" />
        )}
        <AnnouncementMarkdown content={body} />
      </div>
    </Modal>
  );
}
