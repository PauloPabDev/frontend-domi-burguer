import React from "react";
import { GoogleMap, OverlayView, useLoadScript } from "@react-google-maps/api";
import { silverMapStyle } from "@/utils/mapStyles";

const libraries: ("places")[] = ["places"];

export interface MapComponentProps {
  coordinates: { lat: number; lng: number } | null;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  activeZoom?: number;
  minHeight?: string;
  className?: string;
  markerIcon?: string;
  markerSize?: { width: number; height: number };
  markerAnchor?: { x: number; y: number };
  showZoomControl?: boolean;
  showStreetView?: boolean;
  showMapType?: boolean;
  showFullscreen?: boolean;
  customStyles?: google.maps.MapTypeStyle[];
}

export const MapComponent: React.FC<MapComponentProps> = ({
  coordinates,
  defaultCenter = { lat: 6.3017314, lng: -75.5743796 },
  defaultZoom = 13,
  activeZoom = 16,
  minHeight = "223px",
  className = "",
  markerIcon = "/Pin.png",
  markerSize = { width: 70, height: 80 },
  markerAnchor = { x: 20, y: 40 },
  showZoomControl = true,
  showStreetView = false,
  showMapType = false,
  showFullscreen = false,
  customStyles = silverMapStyle,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

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
      mapContainerStyle={{
        width: "100%",
        height: "100%",
        minHeight,
      }}
      mapContainerClassName={className}
      center={coordinates || defaultCenter}
      zoom={coordinates ? activeZoom : defaultZoom}
      options={{
        disableDefaultUI: false,
        zoomControl: showZoomControl,
        streetViewControl: showStreetView,
        mapTypeControl: showMapType,
        fullscreenControl: showFullscreen,
        styles: customStyles,
      }}
    >
      {coordinates && (
        <OverlayView
          position={coordinates}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={() => ({
            x: -markerAnchor.x,
            y: -markerAnchor.y,
          })}
        >
          <img
            src={markerIcon}
            alt="marker"
            width={markerSize.width}
            height={markerSize.height}
            style={{ display: "block", pointerEvents: "none" }}
          />
        </OverlayView>
      )}
    </GoogleMap>
  );
};

export default MapComponent;