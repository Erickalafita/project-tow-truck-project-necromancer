"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import styles from '../../page.module.css';
import dashboardStyles from './dashboard.module.css';

interface DriverInfo {
  _id: string;
  userId: string;
  location: {
    coordinates: [number, number];
  };
  available: boolean;
  skills: string[];
}

interface NecromancyRequest {
  _id: string;
  requesterId: string;
  serviceType: string;
  description: string;
  status: string;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
}

const DriverDashboard = () => {
  const router = useRouter();
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [availableRequests, setAvailableRequests] = useState<NecromancyRequest[]>([]);
  const [myRequests, setMyRequests] = useState<NecromancyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationUpdatesActive, setLocationUpdatesActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchDriverInfo = async () => {
      try {
        // First, try to get driver profile
        const response = await fetch('/api/driver/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            router.push('/auth/login');
            return;
          }
          
          // If 404, the user might not be registered as a driver
          if (response.status === 404) {
            setDriverInfo(null);
            setLoading(false);
            return;
          }
          
          throw new Error('Failed to fetch driver info');
        }

        const data = await response.json();
        setDriverInfo(data);
        
        // Then fetch available requests for this driver
        await fetchAvailableRequests(token);
        
        // And fetch requests assigned to this driver
        await fetchMyRequests(token, data._id);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverInfo();
  }, [router]);

  const fetchAvailableRequests = async (token: string) => {
    try {
      const response = await fetch('/api/necromancy/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch available requests');

      const data = await response.json();
      setAvailableRequests(data);
    } catch (err: any) {
      console.error('Error fetching available requests:', err);
    }
  };

  const fetchMyRequests = async (token: string, driverId: string) => {
    try {
      const response = await fetch(`/api/necromancy/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch my requests');

      const data = await response.json();
      setMyRequests(data);
    } catch (err: any) {
      console.error('Error fetching my requests:', err);
    }
  };

  const toggleAvailability = async () => {
    if (!driverInfo) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`/api/driver/${driverInfo._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          available: !driverInfo.available
        })
      });

      if (!response.ok) throw new Error('Failed to update availability');

      const data = await response.json();
      setDriverInfo(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const startLocationUpdates = () => {
    if (!driverInfo || !navigator.geolocation) return;
    
    setLocationUpdatesActive(true);
    
    // Start sending location updates
    const locationInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          try {
            await fetch(`/api/driver/${driverInfo._id}/location`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                location: {
                  type: 'Point',
                  coordinates: [position.coords.longitude, position.coords.latitude]
                }
              })
            });
          } catch (err) {
            console.error('Error updating location:', err);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }, 10000); // Update every 10 seconds
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(locationInterval);
      setLocationUpdatesActive(false);
    };
  };

  const acceptRequest = async (requestId: string) => {
    if (!driverInfo) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`/api/necromancy/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId: driverInfo._id
        })
      });

      if (!response.ok) throw new Error('Failed to accept request');

      // Refresh the lists after accepting
      await fetchAvailableRequests(token);
      await fetchMyRequests(token, driverInfo._id);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Project Necromancer</h1>
          <p>Real-time tow truck tracking service</p>
          <Navigation />
        </header>
        <main className={dashboardStyles.loading}>Loading driver information...</main>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Project Necromancer</h1>
          <p>Real-time tow truck tracking service</p>
          <Navigation />
        </header>
        <main className={dashboardStyles.dashboardMain}>
          <div className={dashboardStyles.notDriver}>
            <h2>Not a Driver</h2>
            <p>Your account is not registered as a driver.</p>
            <p>Please register as a driver to access the driver dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Project Necromancer</h1>
        <p>Real-time tow truck tracking service</p>
        <Navigation />
      </header>

      <main className={dashboardStyles.dashboardMain}>
        <div className={dashboardStyles.dashboardHeader}>
          <h2>Driver Dashboard</h2>
          <div className={dashboardStyles.driverControls}>
            <button
              className={`${dashboardStyles.controlButton} ${driverInfo.available ? dashboardStyles.available : dashboardStyles.unavailable}`}
              onClick={toggleAvailability}
            >
              {driverInfo.available ? 'Go Offline' : 'Go Online'}
            </button>
            <button
              className={`${dashboardStyles.controlButton} ${locationUpdatesActive ? dashboardStyles.active : ''}`}
              onClick={startLocationUpdates}
              disabled={locationUpdatesActive}
            >
              {locationUpdatesActive ? 'Tracking Active' : 'Start Location Tracking'}
            </button>
          </div>
        </div>

        {error && <div className={dashboardStyles.error}>{error}</div>}

        <div className={dashboardStyles.driverSection}>
          <h3>My Requests</h3>
          {myRequests.length === 0 ? (
            <p className={dashboardStyles.emptyMessage}>You haven't accepted any requests yet.</p>
          ) : (
            <div className={dashboardStyles.requestsList}>
              {myRequests.map(request => (
                <div key={request._id} className={dashboardStyles.requestCard}>
                  <h4>{request.serviceType}</h4>
                  <p className={dashboardStyles.description}>{request.description}</p>
                  <div className={dashboardStyles.requestMeta}>
                    <span>Status: {request.status}</span>
                    <span>Created: {formatDate(request.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={dashboardStyles.driverSection}>
          <h3>Available Requests</h3>
          {!driverInfo.available ? (
            <p className={dashboardStyles.emptyMessage}>Go online to see available requests.</p>
          ) : availableRequests.length === 0 ? (
            <p className={dashboardStyles.emptyMessage}>No requests available at the moment.</p>
          ) : (
            <div className={dashboardStyles.requestsList}>
              {availableRequests.map(request => (
                <div key={request._id} className={dashboardStyles.requestCard}>
                  <h4>{request.serviceType}</h4>
                  <p className={dashboardStyles.description}>{request.description}</p>
                  <div className={dashboardStyles.requestMeta}>
                    <span>Created: {formatDate(request.createdAt)}</span>
                    <button
                      className={dashboardStyles.acceptButton}
                      onClick={() => acceptRequest(request._id)}
                    >
                      Accept Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2023 Project Necromancer - All rights reserved</p>
      </footer>
    </div>
  );
};

export default DriverDashboard; 