import { cn } from "@/lib/utils";

// Bloque base de los skeletons, con brillo (shimmer en globals.css). Con "reducir movimiento" queda gris y quieto.
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton-shimmer rounded-md bg-neutral-black-10", className)}
      {...props}
    />
  );
}
