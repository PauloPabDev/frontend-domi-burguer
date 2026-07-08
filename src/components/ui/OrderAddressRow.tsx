'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  MoreHorizontal,
  Navigation,
  Navigation2,
  Copy,
  Check,
  X,
  Home,
  Building2,
  Trees,
  Briefcase,
  MessageSquare,
  Clock,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location, PropertyType } from '@/types/locations';

interface OrderAddressRowProps {
  location?: Location;
  address?: string;
  floor?: string;
  /** Compacto: sin fondo ni acciones, solo ícono y texto pequeños (para recepción) */
  compact?: boolean;
  className?: string;
}

const PROPERTY_ICONS: Record<PropertyType, React.ReactNode> = {
  house: <Home size={13} />,
  building: <Building2 size={13} />,
  urbanization: <Trees size={13} />,
  office: <Briefcase size={13} />,
};

const PROPERTY_LABELS: Record<PropertyType, string> = {
  house: 'Casa',
  building: 'Edificio',
  urbanization: 'Urbanización',
  office: 'Oficina',
};

interface AddressSheetProps {
  location?: Location;
  address?: string;
  floor?: string;
  onClose: () => void;
}

function AddressSheet({ location, address, floor, onClose }: AddressSheetProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const displayAddress = location?.address ?? address ?? 'Sin dirección';
  const displayFloor = location?.floor ?? floor;
  const hasCoords =
    location?.coordinates?.lat != null && location?.coordinates?.lng != null;

  const coordsQuery = hasCoords
    ? `${location!.coordinates.lat},${location!.coordinates.lng}`
    : encodeURIComponent(displayAddress);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    window.open(
      hasCoords
        ? `https://www.google.com/maps?q=${coordsQuery}`
        : `https://www.google.com/maps/search/?api=1&query=${coordsQuery}`,
      '_blank',
    );
  };

  const handleOpenWaze = () => {
    window.open(
      hasCoords
        ? `https://waze.com/ul?ll=${coordsQuery}&navigate=yes`
        : `https://waze.com/ul?q=${coordsQuery}`,
      '_blank',
    );
  };
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-500 flex items-center justify-center transition-opacity duration-250',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden transition-transform duration-250 ease-out relative z-10 w-[300px] bg-white rounded-2xl shadow-xl overflow-hidden',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-neutral-black-10">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-black-80 truncate">
              {location?.name ?? 'Dirección de entrega'}
            </p>
            {location?.propertyType && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-neutral-black-50">
                  {PROPERTY_ICONS[location.propertyType]}
                </span>
                <span className="text-xs text-neutral-black-50">
                  {PROPERTY_LABELS[location.propertyType]}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-neutral-black-10 transition-colors shrink-0 ml-3"
          >
            <X size={16} className="text-neutral-black-50" />
          </button>
        </div>

        {/* Detalle de dirección */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Dirección + piso */}
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 shrink-0 mt-0.5">
              <MapPin size={15} className="text-primary-red" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-black-50 uppercase tracking-wide mb-1">
                Dirección
              </p>
              <p className="text-sm text-neutral-black-80 leading-snug">{displayAddress}</p>
              {displayFloor && (
                <p className="text-xs text-neutral-black-50 mt-1">
                  Piso / Apto: <span className="font-medium">{displayFloor}</span>
                </p>
              )}
            </div>
          </div>

          {/* Comentarios */}
          {location?.comment && (
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 shrink-0 mt-0.5">
                <MessageSquare size={15} className="text-amber-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-black-50 uppercase tracking-wide mb-1">
                  Comentarios
                </p>
                <p className="text-sm text-neutral-black-80 leading-snug">{location.comment}</p>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col divide-y divide-neutral-black-10 border-t border-neutral-black-10">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-black-3 transition-colors text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-black-10 shrink-0">
              {copied
                ? <Check size={15} className="text-green-600" />
                : <Copy size={15} className="text-neutral-black-50" />}
            </span>
            {copied ? 'Dirección copiada' : 'Copiar dirección'}
          </button>

          <button
            type="button"
            onClick={handleOpenMaps}
            className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-black-3 transition-colors text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 shrink-0">
              <Navigation size={15} className="text-blue-600" />
            </span>
            Abrir en Google Maps
          </button>

          <button
            type="button"
            onClick={handleOpenWaze}
            className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-black-3 transition-colors text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-50 shrink-0">
              <Navigation2 size={15} className="text-cyan-600" />
            </span>
            Ir a Waze
          </button>

          <button
            type="button"
            disabled
            className="flex items-center gap-3 px-5 py-3.5 text-left opacity-50 cursor-not-allowed"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-black-10 shrink-0">
              <Clock size={15} className="text-neutral-black-50" />
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-black-80">Historial de dirección</p>
              <p className="text-xs text-neutral-black-50">Próximamente</p>
            </div>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center gap-3 px-5 py-3.5 text-left opacity-50 cursor-not-allowed"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-black-10 shrink-0">
              <Camera size={15} className="text-neutral-black-50" />
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-black-80">Fotos del lugar</p>
              <p className="text-xs text-neutral-black-50">Próximamente</p>
            </div>
          </button>
        </div>

        <div className="pb-8" />
      </div>
    </div>,
    document.body,
  );
}

export function OrderAddressRow({
  location,
  address,
  floor,
  compact = false,
  className,
}: OrderAddressRowProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const displayAddress = location?.address ?? address ?? 'Sin dirección';
  const displayFloor = location?.floor ?? floor;
  const hasCoords =
    location?.coordinates?.lat != null && location?.coordinates?.lng != null;

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasCoords) return;
    window.open(
      `https://www.google.com/maps?q=${location!.coordinates.lat},${location!.coordinates.lng}`,
      '_blank',
    );
  };

  const handleOpenSheet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSheetOpen(true);
  };

  if (compact) {
    return (
      <>
        <div className={cn('flex items-center gap-1.5', className)}>
          <MapPin size={11} className="text-neutral-black-50 shrink-0" />
          <p className="text-xs text-neutral-black-50 line-clamp-1 flex-1 min-w-0">{displayAddress}</p>
          <button
            type="button"
            onClick={handleOpenSheet}
            title="Más opciones"
            className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-neutral-black-10 transition-colors shrink-0"
          >
            <MoreHorizontal size={12} className="text-neutral-black-40" />
          </button>
        </div>

        {sheetOpen && (
          <AddressSheet
            location={location}
            address={address}
            floor={floor}
            onClose={() => setSheetOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-2 bg-neutral-black-5 rounded-xl px-0 py-0',
          className,
        )}
      >
        {/* <MapPin size={15} className="text-primary-red mt-0.5 shrink-0" /> */}

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-black-80 leading-snug">{displayAddress}</p>
          {(displayFloor || location?.comment) && (
            <div className="mt-0.5 space-y-0.5">
              {displayFloor && (
                <p className="text-xs text-neutral-black-70">
                  Piso / Apto: <span className="font-medium">{displayFloor}</span>
                </p>
              )}
              {location?.comment && (
                <p className="text-xs text-neutral-black-70 ">
                  {location.comment}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 -mr-0.5 mt-0.5">
          <button
            type="button"
            onClick={handleOpenSheet}
            title="Más opciones"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-neutral-black-10 transition-colors"
          >
            <MoreHorizontal size={22} className="text-neutral-black-50" />
          </button>
          {hasCoords && (
            <button
              type="button"
              onClick={handleOpenMaps}
              title="Abrir en Google Maps"
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Navigation size={26} className="text-blue-500" />
            </button>
          )}

        </div>
      </div>

      {sheetOpen && (
        <AddressSheet
          location={location}
          address={address}
          floor={floor}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
