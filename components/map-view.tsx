"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import Image from "next/image";

// Fix for default Leaflet markers in React
const getCustomIcon = () => {
  if (typeof window === "undefined") return null;
  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface MapViewProps {
  properties: any[];
}

export function MapView({ properties }: MapViewProps) {
  const center = useMemo(() => {
    const firstWithCoords = properties.find(p => p.lat && p.lng);
    return {
      lat: firstWithCoords?.lat || 6.5244,
      lng: firstWithCoords?.lng || 3.3792,
    };
  }, [properties]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-xl border border-primary/10 relative z-0">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={11} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((p) => (
          p.lat && p.lng && typeof window !== "undefined" && (
            <Marker 
              key={p._id} 
              position={[p.lat, p.lng]} 
              icon={getCustomIcon()!}
            >
              <Popup>
                <Link href={`/property/${p._id}`} className="block w-48 overflow-hidden group">
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-2">
                    <Image src={p.images[0]} alt="" fill className="object-cover" />
                  </div>
                  <h4 className="font-heading font-bold text-foreground text-sm line-clamp-1">{p.title}</h4>
                  <p className="text-primary font-black text-sm">₦{p.price.toLocaleString()}/yr</p>
                </Link>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
