"use client";

import React, { useCallback, useEffect, useRef } from "react";
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
  /** Foto del domiciliario en la app (resuelta cruzando Traccar <-> WorkerUser por email) */
  avatarUrl?: string;
  isSelected: boolean;
  isOffline?: boolean;
  onClick: () => void;
}

function CourierPin({ label, avatarUrl, isSelected, isOffline, onClick }: CourierPinProps) {
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
          // Con foto: fondo blanco y el borde indica en vivo/offline. Sin foto: círculo de color como antes.
          border: `2px solid ${avatarUrl ? color : "white"}`,
          backgroundColor: avatarUrl ? "white" : color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isSelected ? 18 : 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : label ? (
          <span style={{ color: "white", fontWeight: "bold", userSelect: "none", lineHeight: 1 }}>
            {label.charAt(0).toUpperCase()}
          </span>
        ) : (
          "🛵"
        )}
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

  const mapRef = useRef<google.maps.Map | null>(null);
  // Centro inicial: se calcula una sola vez, al montar. De ahí en adelante el
  // mapa es "no controlado" — nunca se recentra como efecto secundario de que
  // lleguen nuevas ubicaciones de domiciliarios (eso era lo que causaba el
  // parpadeo: cada actualización pasaba un objeto center/zoom nuevo a
  // GoogleMap, forzando un setCenter/setZoom constante).
  const initialCenterRef = useRef(center || markers[0]?.position || DEFAULT_CENTER);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      onMarkerClick?.(markerId);
    },
    [onMarkerClick]
  );

  // Solo movemos el mapa cuando el padre da un centro explícito (p. ej. al
  // seleccionar un pedido). Si no hay centro — como al hacer clic en un
  // domiciliario, que no tiene una posición "objetivo" de selección — el mapa
  // se queda quieto donde el usuario lo dejó.
  useEffect(() => {
    if (!center || !mapRef.current) return;
    mapRef.current.panTo(center);
    mapRef.current.setZoom(selectedZoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);

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

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%", minHeight }}
      mapContainerClassName={className}
      onLoad={(map) => { mapRef.current = map; }}
      onUnmount={() => { mapRef.current = null; }}
      center={initialCenterRef.current}
      zoom={defaultZoom}
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
                avatarUrl={marker.avatarUrl}
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
