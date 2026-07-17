"use client";

import { useEffect } from "react";
import { addToast } from "@heroui/toast";
import { Button } from "@/components/ui/button";
import { notify } from "@/utils/notify";
import {
  setToastPlacementOverride,
  useToastPlacementOverride,
  type ToastPlacement,
} from "@/components/AppToastProvider";
import { Flame, Bell } from "lucide-react";

// ─── Sección wrapper ────────────────────────────────────────────────────────
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-neutral-900 mb-1">{title}</h2>
      {description && <p className="text-sm text-neutral-500 mb-4">{description}</p>}
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </section>
  );
}

const COLORS = ["default", "primary", "secondary", "success", "warning", "danger", "foreground"] as const;
const VARIANTS = ["solid", "flat", "bordered"] as const;
const RADIUS = ["none", "sm", "md", "lg", "full"] as const;
const PLACEMENTS: ToastPlacement[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

// ─── Página ──────────────────────────────────────────────────────────────────
export default function ToastsTestPage() {
  const placementOverride = useToastPlacementOverride();

  // Al salir de la página se restaura la posición automática por ruta.
  useEffect(() => {
    return () => setToastPlacementOverride(null);
  }, []);

  return (
    <div className="min-h-screen bg-white px-8 py-12 max-w-5xl mx-auto">
      <div className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Toast Notifications</h1>
        <p className="text-neutral-500 mt-1">
          Catálogo de todas las variaciones de <code className="text-sm bg-neutral-100 px-1 rounded">addToast()</code> de HeroUI.
          Haz clic en cada botón para disparar el toast.
        </p>
      </div>

      {/* ── Posición ── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Posición (placement)</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Elige en qué esquina aparecen los toasts. Aplica a todos los botones de esta página.
          Con <span className="font-mono text-xs bg-neutral-100 px-1 rounded">auto</span> se usa la posición
          normal de la app (arriba a la derecha; abajo a la derecha en recepción).
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={placementOverride === null ? "primary" : "outline"}
            size="sm"
            onClick={() => setToastPlacementOverride(null)}
          >
            auto
          </Button>
          {PLACEMENTS.map((placement) => (
            <Button
              key={placement}
              variant={placementOverride === placement ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setToastPlacementOverride(placement);
                addToast({
                  title: `Posición: ${placement}`,
                  description: "Los toasts saldrán en esta esquina.",
                  color: "primary",
                });
              }}
            >
              {placement}
            </Button>
          ))}
        </div>
      </section>

      {/* ── Helpers de la app ── */}
      <Section
        title="Helpers de la app (notify)"
        description="Los tres helpers de src/utils/notify.ts — lo que realmente se usa en la app."
      >
        <Button variant="primary" onClick={() => notify.success("¡Orden creada!", "La orden fue enviada a cocina.")}>
          notify.success
        </Button>
        <Button variant="destructive" onClick={() => notify.error("Error al cambiar estado", "No se pudo conectar con el servidor.")}>
          notify.error
        </Button>
        <Button variant="outline" onClick={() => notify.info("Nueva orden", "Llegó un pedido de Juan Pérez.")}>
          notify.info
        </Button>
      </Section>

      {/* ── Colores ── */}
      <Section
        title="Colores (color)"
        description="Los 7 colores disponibles de HeroUI."
      >
        {COLORS.map((color) => (
          <Button
            key={color}
            variant="outline"
            onClick={() =>
              addToast({
                title: `Color: ${color}`,
                description: "Descripción de ejemplo del toast.",
                color,
              })
            }
          >
            {color}
          </Button>
        ))}
      </Section>

      {/* ── Variantes ── */}
      <Section
        title="Variantes (variant)"
        description="Tres estilos visuales, combinados con color success para comparar."
      >
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant="outline"
            onClick={() =>
              addToast({
                title: `Variant: ${variant}`,
                description: "Toast con color success.",
                color: "success",
                variant,
              })
            }
          >
            {variant}
          </Button>
        ))}
      </Section>

      {/* ── Matriz color × variante ── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Matriz color × variante</h2>
        <p className="text-sm text-neutral-500 mb-4">Todas las combinaciones posibles.</p>
        <div className="flex flex-col gap-3">
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap gap-2 items-center">
              <span className="inline-block w-20 bg-neutral-100 text-neutral-500 text-xs px-2 py-0.5 rounded font-mono">
                {variant}
              </span>
              {COLORS.map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  size="sm"
                  onClick={() => addToast({ title: `${color} / ${variant}`, color, variant })}
                >
                  {color}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Radius ── */}
      <Section
        title="Bordes (radius)"
        description="Curvatura de las esquinas del toast."
      >
        {RADIUS.map((radius) => (
          <Button
            key={radius}
            variant="outline"
            onClick={() =>
              addToast({
                title: `Radius: ${radius}`,
                description: "Descripción de ejemplo.",
                color: "primary",
                radius,
              })
            }
          >
            {radius}
          </Button>
        ))}
      </Section>

      {/* ── Timeout y progreso ── */}
      <Section
        title="Duración (timeout)"
        description="Tiempo antes de cerrarse, con o sin barra de progreso."
      >
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Se cierra en 2 segundos",
              color: "warning",
              timeout: 2000,
            })
          }
        >
          timeout 2s
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Con barra de progreso",
              description: "Se cierra en 5 segundos.",
              color: "primary",
              timeout: 5000,
              shouldShowTimeoutProgress: true,
            })
          }
        >
          timeout 5s + progreso
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "No se cierra solo",
              description: "Hay que cerrarlo manualmente con la X.",
              color: "danger",
              timeout: Infinity,
            })
          }
        >
          sin timeout
        </Button>
      </Section>

      {/* ── Íconos ── */}
      <Section
        title="Íconos (icon / hideIcon)"
        description="Ícono personalizado o toast sin ícono."
      >
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Ícono personalizado",
              description: "Con una llama de lucide-react.",
              color: "warning",
              icon: <Flame className="w-5 h-5" />,
            })
          }
        >
          icon custom
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Campana de notificación",
              color: "primary",
              icon: <Bell className="w-5 h-5" />,
            })
          }
        >
          icon campana
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Sin ícono",
              description: "hideIcon: true",
              color: "success",
              hideIcon: true,
            })
          }
        >
          hideIcon
        </Button>
      </Section>

      {/* ── Extras ── */}
      <Section
        title="Extras (endContent, hideCloseButton, promise)"
        description="Contenido extra al final, sin botón de cerrar, y estado de carga con promesa."
      >
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Orden #123 lista",
              description: "¿Deseas verla?",
              color: "success",
              endContent: (
                <Button size="sm" variant="primary">
                  Ver
                </Button>
              ),
            })
          }
        >
          endContent (botón)
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Sin botón de cerrar",
              description: "Desaparece solo.",
              color: "default",
              hideCloseButton: true,
            })
          }
        >
          hideCloseButton
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            addToast({
              title: "Guardando orden...",
              description: "Muestra spinner mientras la promesa resuelve (3s).",
              color: "primary",
              promise: new Promise((resolve) => setTimeout(resolve, 3000)),
            })
          }
        >
          promise (loading 3s)
        </Button>
      </Section>

      {/* ── Casos reales ── */}
      <Section
        title="Casos reales de la app"
        description="Los toasts tal como se disparan en recepción y el checkout."
      >
        <Button variant="primary" onClick={() => notify.success("¡Orden creada!", "La orden fue enviada a cocina.")}>
          Orden creada
        </Button>
        <Button variant="primary" onClick={() => notify.success("Cocina actualizada", "La cocina fue asignada correctamente.")}>
          Cocina asignada
        </Button>
        <Button variant="primary" onClick={() => notify.success("Orden cancelada", "La orden fue eliminada correctamente.")}>
          Orden cancelada
        </Button>
        <Button variant="destructive" onClick={() => notify.error("Error al asignar domiciliario", "Request failed with status 500")}>
          Error domiciliario
        </Button>
        <Button variant="destructive" onClick={() => notify.error("Error al registrar pago")}>
          Error pago (sin descripción)
        </Button>
      </Section>

      {/* ── Stress test ── */}
      <Section
        title="Varios a la vez"
        description="Dispara varios toasts seguidos para ver cómo se apilan (maxVisibleToasts)."
      >
        <Button
          variant="dark"
          onClick={() => {
            notify.success("Toast 1", "Primero");
            notify.error("Toast 2", "Segundo");
            notify.info("Toast 3", "Tercero");
            addToast({ title: "Toast 4", description: "Cuarto", color: "warning" });
            addToast({ title: "Toast 5", description: "Quinto", color: "secondary" });
          }}
        >
          Disparar 5 toasts
        </Button>
      </Section>

      <p className="text-sm text-neutral-400 border-t pt-6">
        Nota: en la app la posición depende de la ruta — en <code className="bg-neutral-100 px-1 rounded">/recepcion</code> salen
        abajo a la derecha y en el resto arriba a la derecha. El selector de arriba solo aplica mientras estés en esta página;
        al salir se restaura la posición automática. Ver{" "}
        <code className="bg-neutral-100 px-1 rounded">AppToastProvider.tsx</code>.
      </p>
    </div>
  );
}
