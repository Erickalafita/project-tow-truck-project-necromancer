import React from 'react';
const { useState, useEffect } = React;

function ClientComponent() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState('');
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // Initial WebSocket connection setup
  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3000'); // Replace with your backend WebSocket URL

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setSocket(newSocket);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Message handling - separated into its own useEffect with socket as dependency
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'request-accepted') {
            console.log('Driver accepted!', message.data);
            // Update UI to show driver details
            setDriverInfo(message.data);
          } else {
            console.log('Received message:', message);
            setMessage(JSON.stringify(message));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          setMessage(event.data);
        }
      };
    }
  }, [socket]); // Run this effect when socket changes

  const sendNecromancyRequest = () => {
    if (socket) {
      const requestData = {
        location: { type: 'Point', coordinates: [1.23, 4.56] },
        serviceType: 'Emergency Towing Services',
        description: 'My car broke down!',
      };

      socket.send(JSON.stringify({ type: 'new-request', data: requestData }));
    }
  };

  const sendCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // Send location to backend
        setLocation({ lat: latitude, lng: longitude });
        
        if (socket) {
          socket.send(JSON.stringify({
            type: 'update-location',
            data: {
              driverId: driverInfo?.driverId,
              location: {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
            }
          }));
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <div>
      <h1>Client Component</h1>
      <p>WebSocket Status: {socket ? 'Connected' : 'Disconnected'}</p>
      {message && <p>Received: {message}</p>}
      {driverInfo && (
        <div>
          <h2>Driver Accepted!</h2>
          <p>Driver ID: {driverInfo.driverId}</p>
          <p>Request ID: {driverInfo.requestId}</p>
          <button onClick={sendCurrentLocation}>Send Current Location</button>
        </div>
      )}
      {location && (
        <p>Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
      )}
      <button onClick={sendNecromancyRequest}>Send Necromancy Request</button>
    </div>
  );
}

export default ClientComponent; 