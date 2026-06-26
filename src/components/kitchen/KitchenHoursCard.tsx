"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock } from "lucide-react";
import { OpeningHoursResult } from "@/utils/openingHoursParser";

interface KitchenHoursCardProps {
  parsedHours: OpeningHoursResult | null;
  isLoading?: boolean;
}

export const KitchenHoursCard = ({ parsedHours, isLoading }: KitchenHoursCardProps) => {
  if (isLoading) {
    return (
      <Card className="bg-[#F7F7F7] shadow-none rounded-2xl border-0">
        <CardContent className="p-6 flex flex-col gap-5">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
          <Separator className="bg-gray-300" />
          <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#F7F7F7] shadow-none rounded-2xl border-0">
      <CardContent className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span className="body-font font-bold">Horarios</span>
        </div>

        <Separator className="bg-gray-300" />

        {parsedHours?.schedules && parsedHours.schedules.length > 0 ? (
          <div className="flex flex-col gap-3">
            {parsedHours.schedules.map((schedule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <div className="flex items-start gap-1 flex-1">
                  <span className="flex-1 body-font">{schedule.days}</span>
                  {/* <span className="body-font font-bold">{schedule.hours}</span> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-neutral-black-50">
            <Clock className="w-5 h-5" />
            <span className="body-font">Horario no disponible</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
