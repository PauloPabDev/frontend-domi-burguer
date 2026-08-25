"use client";

import React, { useCallback } from "react";
import { GoogleMap, OverlayView, useLoadScript } from "@react-google-maps/api";
import { silverMapStyle } from "@/utils/mapStyles";

const libraries: ("places")[] = ["places"];

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  label?: string;
  color?: string;
  avatarUrl?: string;
  clientName?: string;
  isUnassigned?: boolean;
  courierAvatarUrl?: string;
  courierName?: string;
  /** 'courier' renderiza un pin de ubicación en vivo (Traccar) en vez del pin de pedido */
  type?: 'order' | 'courier';
  /** Solo para type: 'courier' — atenúa el pin cuando el dispositivo no está online */
  isOffline?: boolean;
}

interface AvatarPinProps {
  color: string;
  label: string;
  isSelected: boolean;
  isUnassigned?: boolean;
  courierAvatarUrl?: string;
  courierName?: string;
  onClick: () => void;
}

function AvatarPin({ color, label, isSelected, isUnassigned, courierAvatarUrl, courierName, onClick }: AvatarPinProps) {
  const size = isSelected ? 52 : 40;
  const borderWidth = isSelected ? 3 : 2;
  const courierSize = isSelected ? 22 : 18;
  const hasCourier = courierAvatarUrl || courierName;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        filter: isSelected
          ? "drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
          : "drop-shadow(0 2px 5px rgba(0,0,0,0.3))",
        transition: "all 0.15s ease",
        zIndex: isSelected ? 1000 : 1,
        position: "relative",
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* Circle container — relative so ping ring and courier badge can be absolute */}
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>

        {/* Radar ping ring for unassigned orders */}
        {isUnassigned && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              animation: "marker-ping 1.8s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Main circle with order number */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: `${borderWidth}px solid ${color}`,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color,
              fontWeight: "bold",
              fontSize: isSelected ? 18 : 14,
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        </div>

        {/* Courier badge — top-right corner */}
        {hasCourier && (
          <div
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              width: courierSize,
              height: courierSize,
              borderRadius: "50%",
              border: "2px solid white",
              backgroundColor: "#374151",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
              flexShrink: 0,
            }}
          >
            {courierAvatarUrl ? (
              <img
                src={courierAvatarUrl}
                alt={courierName || "domiciliario"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "white", fontWeight: "bold", fontSize: 8, userSelect: "none", lineHeight: 1 }}>
                {courierName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Triangle pointer */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: `10px solid ${color}`,
          marginTop: -1,
        }}
      />
    </div>
  );
}

interface CourierPinProps {
  label: string;
  isSelected: boolean;
  isOffline?: boolean;
  onClick: () => void;
}

function CourierPin({ label, isSelected, isOffline, onClick }: CourierPinProps) {
  const size = isSelected ? 40 : 32;
  const color = isOffline ? "#9CA3AF" : "#34C759"; // gris si offline, verde (color de rol domiciliario) si online

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        filter: isSelected
          ? "drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
          : "drop-shadow(0 2px 5px rgba(0,0,0,0.3))",
        transition: "all 0.15s ease",
        zIndex: isSelected ? 999 : 2,
        position: "relative",
        transform: "translate(-50%, -50%)",
        opacity: isOffline ? 0.6 : 1,
      }}
      title={label}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid white`,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isSelected ? 18 : 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      >
        🛵
      </div>
      {isSelected && (
        <span
          style={{
            marginTop: 2,
            fontSize: 11,
            fontWeight: 600,
            color: "#111827",
            backgroundColor: "white",
            padding: "1px 6px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
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
      mapContainerStyle={{ width: "100%", height: "100%", minHeight }}
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
        const color = marker.color || "#FF5733";

        return (
          <OverlayView
            key={marker.id}
            position={marker.position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({ x: 0, y: 0 })}
          >
            {marker.type === "courier" ? (
              <CourierPin
                label={marker.label || ""}
                isSelected={isSelected}
                isOffline={marker.isOffline}
                onClick={() => handleMarkerClick(marker.id)}
              />
            ) : (
              <AvatarPin
                color={color}
                label={marker.label || ""}
                isSelected={isSelected}
                isUnassigned={marker.isUnassigned}
                courierAvatarUrl={marker.courierAvatarUrl}
                courierName={marker.courierName}
                onClick={() => handleMarkerClick(marker.id)}
              />
            )}
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
};

export default MultiMarkerMap;
