"use client";

import React, { useCallback } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { silverMapStyle } from "@/utils/mapStyles";

const libraries: ("places")[] = ["places"];

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  label?: string;
  color?: string;
}

function makePinSvgUrl(fill: string, selected: boolean): string {
  const size = selected ? 48 : 36;
  const ring = selected ? 6 : 5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.25)}" viewBox="0 0 40 50"><path d="M20 0C9 0 0 9 0 20c0 14 20 30 20 30s20-16 20-30C40 9 31 0 20 0z" fill="${fill}"/><circle cx="20" cy="20" r="${ring}" fill="white" opacity="0.9"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

interface MultiMarkerMapProps {
  markers: MapMarker[];
  selectedMarkerId?: string;
  center?: { lat: number; lng: number };
  onMarkerClick?: (markerId: string) => void;
  minHeight?: string;
  className?: string;
  defaultZoom?: number;
  selectedZoom?: number;
}

const DEFAULT_CENTER = { lat: 6.3017314, lng: -75.5743796 };

export const MultiMarkerMap: React.FC<MultiMarkerMapProps> = ({
  markers,
  selectedMarkerId,
  center,
  onMarkerClick,
  minHeight = "200px",
  className = "",
  defaultZoom = 13,
  selectedZoom = 15,
}) => {
  console.log("Markers en MultiMarkerMap:", markers);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      onMarkerClick?.(markerId);
    },
    [onMarkerClick]
  );

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ minHeight }}
      >
        <span className="text-gray-500">Cargando mapa...</span>
      </div>
    );
  }

  const mapCenter = center || (markers.length > 0 ? markers[0].position : DEFAULT_CENTER);
  const zoom = selectedMarkerId ? selectedZoom : defaultZoom;

  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "100%",
        minHeight,
      }}

      mapContainerClassName={className}
      center={mapCenter}
      zoom={zoom}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: false,
        styles: silverMapStyle,
      }}
    >
      {markers.map((marker) => {
        const isSelected = marker.id === selectedMarkerId;
        const pinUrl = marker.color
          ? makePinSvgUrl(marker.color, isSelected)
          : "/Pin.png";
        const w = marker.color ? (isSelected ? 48 : 36) : (isSelected ? 70 : 50);
        const h = marker.color ? (isSelected ? 60 : 45) : (isSelected ? 80 : 58);
        return (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => handleMarkerClick(marker.id)}
            icon={{
              url: pinUrl,
              scaledSize: new google.maps.Size(w, h),
              anchor: new google.maps.Point(w / 2, h),
            }}
            opacity={isSelected ? 1 : 0.7}
            title={marker.label}
          />
        );
      })}
    </GoogleMap>
  );
};

export default MultiMarkerMap;
