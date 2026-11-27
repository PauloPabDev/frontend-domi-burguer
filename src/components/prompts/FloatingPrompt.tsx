"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { LogoMobile } from "@/components/ui/icons";

interface FloatingPromptProps {
  title: string;
  description?: ReactNode;
  actions: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}

// El dock móvil mide 72 px y el logo central sobresale 34 px: los avisos van por encima de eso.
const POSITION =
  "fixed left-4 right-4 z-[500] mx-auto max-w-md bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+8.25rem)] lg:bottom-4";

/** Tarjeta única para cookies, inicio de sesión e instalación: misma posición, animación y cierre. */
export function FloatingPrompt({ title, description, actions, onClose, closeLabel = "Cerrar" }: FloatingPromptProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="dialog"
      aria-label={title}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={POSITION}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-4">
        <div className="flex items-start gap-3">
          <LogoMobile width={32} height={45} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-neutral-black-80">{title}</p>
            {description && <p className="text-xs text-neutral-600 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={closeLabel}
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">{actions}</div>
      </div>
    </motion.div>
  );
}
