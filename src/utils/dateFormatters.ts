import { FirebaseTimestamp } from "@/types/points";

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-ES");
}

export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatFirebaseTimestamp(timestamp: FirebaseTimestamp): string {
  return new Date(timestamp._seconds * 1000).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
