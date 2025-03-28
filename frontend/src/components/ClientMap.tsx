// frontend/src/components/ClientMap.tsx
"use client";

import React from "react";
const { useState, useEffect, useRef, useCallback, useMemo } = React;
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker as MarkerComponent } from "@react-google-maps/api";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/hooks/useAuth";

// Type assertions to fix JSX errors
const GoogleMap = GoogleMapComponent as any;
const Marker = MarkerComponent as any;

interface DriverLocation {
  coordinates: [number, number];
}

interface NecromancyRequest {
  _id: string;
  serviceType: string;
  status: string;
  description: string;
  createdAt: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

const ClientMap = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [driverLocations, setDriverLocations] = useState<{ [driverId: string]: DriverLocation }>({});
  const [error, setError] = useState<string | null>(null);
  const [necroRequest, setNecroRequest] = useState<NecromancyRequest[]>([]);
  const { socket } = useSocket();
  const { token } = useAuth();
  const fallbackCenter = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []); // Default: San Francisco
  const [center, setCenter] = useState<{ lat: number; lng: number }>(fallbackCenter);

  const containerStyle = useMemo(() => ({ 
    width: "100%", 
    height: "100%",
    borderRadius: "8px"
  }), []);

  // Only create carIcon when maps API is loaded
  const carIcon = useMemo(
    () => isLoaded ? {
      url: "/car-icon.png",
      scaledSize: new google.maps.Size(40, 40),
    } : undefined,
    [isLoaded]
  );

  // Fetch necromancy requests
  useEffect(() => {
    const fetchNecromancyRequest = async () => {
      try {
        const response = await fetch(`/api/necromancy`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setNecroRequest(data);
      } catch (error: any) {
        console.error("Error fetching necromancy requests:", error);
        setError(error.message || "Failed to fetch location");
      }
    };

    if (token) {
      fetchNecromancyRequest();
    }
  }, [token]);

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
        },
        () => {
          console.warn("Geolocation failed, using fallback location");
          setCenter(fallbackCenter);
        }
      );
    };

    getCurrentLocation();
  }, [fallbackCenter]);

  // Listen for driver location updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleDriverLocationUpdate = (data: { driverId: string; location: DriverLocation }) => {
      setDriverLocations((prevLocations: { [driverId: string]: DriverLocation }) => ({
        ...prevLocations,
        [data.driverId]: data.location,
      }));
    };

    socket.on("driver-location-updated", handleDriverLocationUpdate);
    console.log("Socket event listener added");

    return () => {
      socket.off("driver-location-updated", handleDriverLocationUpdate);
      console.log("Socket event listener removed");
    };
  }, [socket]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  return (
    <>
      {error && <p className="error-message">{error}</p>}
      {!isLoaded && (
        <div className="loading-spinner">
          <p>Loading map...</p>
        </div>
      )}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {Object.entries(driverLocations).length > 0 ? (
            Object.entries(driverLocations).map(([driverId, location]: [string, DriverLocation]) => (
              <Marker
                key={driverId}
                position={{
                  lat: location.coordinates[1],
                  lng: location.coordinates[0],
                }}
                icon={carIcon}
              />
            ))
          ) : (
            <></> // Keep empty for valid children in GoogleMap
          )}
        </GoogleMap>
      )}
      {isLoaded && Object.entries(driverLocations).length === 0 && (
        <p>No drivers currently available. Please wait...</p>
      )}
    </>
  );
};

export default ClientMap;

