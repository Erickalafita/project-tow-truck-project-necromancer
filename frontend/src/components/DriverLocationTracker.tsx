"use client";

import React from 'react';
const { useState, useEffect, useRef } = React;
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface LocationState {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface DriverLocationTrackerProps {
  driverId: string;
  token: string;
  updateInterval?: number; // Time in ms between location updates
}

const DriverLocationTracker: React.FC<DriverLocationTrackerProps> = ({ 
  driverId, 
  token,
  updateInterval = 10000 // Default to 10 seconds
}) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Ref to store the isTracking value
  const isTrackingRef = useRef(isTracking);

  useEffect(() => {
      isTrackingRef.current = isTracking; // Update the ref
  }, [isTracking]);

  // Connect to WebSocket
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    socketRef.current = io(socketUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`, // Include token for authentication
      },
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    const reconnect = () => {
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        socketRef.current?.connect();
      }, 3000); // Attempt to reconnect every 3 seconds
    };

    socketRef.current.on('disconnect', reconnect)

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('disconnect', reconnect);
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  // Start/stop tracking based on isTracking state
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking]);

  // Get single location update
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };
        
        setLocation(newLocation);
        sendLocationToBackend(newLocation);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        console.error('Geolocation error:', error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Start continuous tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    // First get immediate position
    getCurrentLocation();
    
    // Then start watching position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        };
        
        setLocation(newLocation);
        sendLocationToBackend(newLocation);
      },
      (error) => {
        setError(`Error tracking location: ${error.message}`);
        console.error('Geolocation tracking error:', error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Send location to backend via REST API
  const sendLocationToBackend = async (locationData: LocationState) => {
    try {
      // Format location for the API
      const locationPayload = {
        location: {
          type: 'Point',
          coordinates: [locationData.longitude, locationData.latitude] // Note: GeoJSON uses [longitude, latitude]
        }
      };

      // Send via HTTP
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/drivers/${driverId}/location`,
        locationPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Also send via WebSocket for real-time tracking
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('location-update', {
          driverId,
          location: locationPayload.location,
          timestamp: locationData.timestamp
        });
      }

      console.log('Location sent successfully');
      setError(null);  // Clear any previous error messages
    } catch (err:any) {
      console.error('Error sending location to server:', err);
      setError(err.message || "Failed to send location"); // Display error to the user
    }
  };

  return (
    <div className="location-tracker">
      <h3>Location Tracker</h3>
      
      <div className="tracker-controls">
        <button 
          onClick={() => setIsTracking(!isTracking)}
          className={isTracking ? "btn-stop" : "btn-start"}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </button>
        
        {!isTracking && (
          <button onClick={getCurrentLocation} className="btn-update">
            Update Location Now
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {location && (
        <div className="location-info">
          <p>Current Location:</p>
          <p>Latitude: {location.latitude.toFixed(6)}</p>
          <p>Longitude: {location.longitude.toFixed(6)}</p>
          <p>Last Updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default DriverLocationTracker; 