"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in React
const getCustomIcon = () => {
  if (typeof window === "undefined") return null;
  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41]
  });
};

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapEvents({ onLocationSelect, setMarker }: { onLocationSelect: any, setMarker: any }) {
  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [marker, setMarker] = useState<any>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-primary/10 relative z-0">
      <MapContainer
        center={marker || [6.5244, 3.3792]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onLocationSelect={onLocationSelect} setMarker={setMarker} />
        {marker && typeof window !== "undefined" && <Marker position={[marker.lat, marker.lng]} icon={getCustomIcon()!} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-foreground/60 shadow-sm pointer-events-none z-[1000]">
        Click on the map to drop a pin
      </div>
    </div>
  );
}
