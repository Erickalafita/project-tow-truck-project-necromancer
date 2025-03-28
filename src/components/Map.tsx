"use client";

import React from 'react';
const { useEffect, useRef } = React;
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapProps {
  setLocation: (location: { type: string; coordinates: [number, number] }) => void;
}

const Map: React.FC<MapProps> = ({ setLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize the map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([0, 0], 2); // Default view
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      mapInstance.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Update location state
        setLocation({
          type: 'Point',
          coordinates: [lng, lat], // Leaflet returns lat/lng, but GeoJSON uses lng/lat
        });
        
        // Add or update marker
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(mapInstance.current!);
        }
        
        console.log(`Clicked on [${lat}, ${lng}]`);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [setLocation]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} id="map" />;
};

export default Map; 