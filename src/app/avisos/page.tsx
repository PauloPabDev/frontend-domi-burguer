"use client";

import { useEffect } from "react";
import { Loader2, Megaphone, RefreshCw } from "lucide-react";
import { useActiveAnnouncements } from "@/hooks/useActiveAnnouncements";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { Button } from "@/components/ui/button";
import { track } from "@/utils/analytics";

export default function AvisosPage() {
  const { announcements, loading, error, refetch } = useActiveAnnouncements();

  useEffect(() => {
    track("announcements_page_viewed");
  }, []);

  return (
    <div className="mt-[130px] min-h-[60vh] pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-accent-yellow-40 shrink-0">
            <Megaphone className="w-5 h-5 text-neutral-black-80" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900">Avisos</h1>
            <p className="text-sm text-neutral-black-50">Las novedades y promociones vigentes de Domi Burguer</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-red" size={40} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-neutral-black-50">No pudimos cargar los avisos.</p>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw />} onClick={refetch}>
              Reintentar
            </Button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-black-50">
            <Megaphone size={36} className="opacity-40" />
            <p className="text-sm">No hay avisos por ahora.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onCtaClick={() => track("announcement_clicked", { id: announcement.id, display: "page" })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
