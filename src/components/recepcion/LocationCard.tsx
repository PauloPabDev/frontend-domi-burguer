"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Pencil, Trash2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Location, PropertyType } from '@/types/locations';
import { cn } from '@/lib/utils';
import { MapComponent } from '@/components/map/map';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'Casa',
  building: 'Edificio',
  urbanization: 'Urbanización',
  office: 'Oficina',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-neutral-400 shrink-0 w-28">{label}</span>
      <span className="text-neutral-700 break-words">{value}</span>
    </div>
  );
}

function NotAvailableRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-neutral-50 border border-neutral-100">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-xs text-neutral-300 italic">No disponible</span>
    </div>
  );
}

function LocationDetailModal({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md sm:mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-sm text-neutral-800">{location.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Map */}
        <div className="h-44 w-full overflow-hidden">
          <MapComponent
            coordinates={location.coordinates}
            minHeight="176px"
            showZoomControl={false}
            showStreetView={false}
            showMapType={false}
            showFullscreen={false}
          />
        </div>

        {/* Details */}
        <div className="px-4 py-3 space-y-2">
          <DetailRow label="Dirección" value={location.address} />
          {location.floor && <DetailRow label="Piso / Apto" value={location.floor} />}
          {location.comment && <DetailRow label="Comentario" value={location.comment} />}
          <DetailRow
            label="Tipo de inmueble"
            value={PROPERTY_TYPE_LABELS[location.propertyType] ?? location.propertyType}
          />
        </div>

        {/* Actions */}
        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-100 text-sm text-neutral-300 cursor-not-allowed"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-100 text-sm text-neutral-300 cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>

        {/* Not available sections */}
        <div className="px-4 pb-5 space-y-2 mt-1">
          <NotAvailableRow icon={<MessageSquare className="w-4 h-4" />} label="Comentarios" />
          <NotAvailableRow icon={<ImageIcon className="w-4 h-4" />} label="Fotos" />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function LocationCard({ location, isSelected, onSelect }: LocationCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(location.id)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(location.id)}
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors w-full cursor-pointer',
          isSelected
            ? 'border-green-500 bg-green-50'
            : 'border-neutral-black-20 hover:border-neutral-black-40 bg-white'
        )}
      >
        <div className={cn(
          'mt-0.5 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
          isSelected ? 'border-green-500' : 'border-neutral-black-30'
        )}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-green-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-black-80 ">{location.name}</p>
          <p className="text-xs text-neutral-black-50">{location.address}</p>
          {location.floor && (
            <p className="text-xs text-neutral-black-40">Piso / Apto: {location.floor}</p>
          )}
          {location.comment && (
            <p className="text-xs text-neutral-black-40 truncate">Comentario: {location.comment}</p>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            className="mt-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            Ver más
          </button>
        </div>

        <MapPin className="w-3.5 h-3.5 text-neutral-black-30 shrink-0 mt-0.5" />
      </div>

      {showModal && (
        <LocationDetailModal
          location={location}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
