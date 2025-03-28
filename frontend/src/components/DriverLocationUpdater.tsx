import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface DriverLocationUpdaterProps {
  driverId: string;
}

const DriverLocationUpdater: React.FC<DriverLocationUpdaterProps> = ({ driverId }) => {
  const { socket, isConnected } = useSocket();
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (!isConnected || !socket) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setLocation(newLocation);
          socket.emit('location-update', { 
            ...newLocation,
            driverId // Include driverId with each update
          }); 
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    };

    // Update location every 5 seconds (adjust as needed)
    const intervalId = setInterval(updateLocation, 5000);

    // Initial location update
    updateLocation();

    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected, socket, driverId]);

  return (
    <div>
      {location ? (
        <p>
          Your Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      ) : (
        <p>Getting your location...</p>
      )}
    </div>
  );
};

export default DriverLocationUpdater; 