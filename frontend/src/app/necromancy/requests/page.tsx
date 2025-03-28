"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import styles from '../../page.module.css';
import requestStyles from './requests.module.css';
import { AuthContext, useAuth } from "@/context/AuthContext";

interface NecromancyRequest {
  _id: string;
  userId: string;
  userName: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  vehicleDescription: string;
  description: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  driverId?: string;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  vehicleDescription: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  }
}

// NecromancyRequestForm component
const NecromancyRequestForm = ({ onSubmit, onCancel }: { 
  onSubmit: (data: FormData) => Promise<void>, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    vehicleDescription: '',
    description: '',
    location: {
      address: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    }
  });

  React.useEffect(() => {
    // Get user's current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'address') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={requestStyles.formGroup}>
        <label htmlFor="vehicleDescription">Vehicle Description</label>
        <input
          type="text"
          id="vehicleDescription"
          name="vehicleDescription"
          value={formData.vehicleDescription}
          onChange={handleChange}
          placeholder="Year, Make, Model, Color"
          required
        />
      </div>
      <div className={requestStyles.formGroup}>
        <label htmlFor="address">Location Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.location.address}
          onChange={handleChange}
          placeholder="Enter your current address"
          required
        />
      </div>
      <div className={requestStyles.formGroup}>
        <label htmlFor="description">Problem Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your situation and what assistance you need..."
          required
        ></textarea>
      </div>
      <div className={requestStyles.formActions}>
        <button type="submit" className={requestStyles.submitButton}>
          Submit Request
        </button>
        <button 
          type="button" 
          className={requestStyles.cancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const NecromancyRequestsPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = React.useState<NecromancyRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/necromancy/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (requestData: FormData) => {
    try {
      const response = await fetch('/api/necromancy/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      fetchRequests();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/necromancy/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      setRequests(requests.map((req: NecromancyRequest) => 
        req._id === requestId ? { ...req, status: 'cancelled' } : req
      ));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return requestStyles.statusPending;
      case 'accepted':
        return requestStyles.statusAccepted;
      case 'completed':
        return requestStyles.statusCompleted;
      case 'cancelled':
        return requestStyles.statusCancelled;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (authLoading) {
    return <div className={requestStyles.loading}>Loading authentication...</div>;
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <div className={requestStyles.requestsMain}>
          <div className={requestStyles.requestsHeader}>
            <h2>Tow Requests</h2>
            {!showForm && (
              <button 
                className={requestStyles.newRequestButton}
                onClick={() => setShowForm(true)}
              >
                Create New Tow Request
              </button>
            )}
          </div>

          {error && <div className={requestStyles.error}>{error}</div>}

          {showForm && (
            <div className={requestStyles.newRequestForm}>
              <h3>Create New Tow Request</h3>
              <NecromancyRequestForm 
                onSubmit={handleCreateRequest} 
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {loading ? (
            <div className={requestStyles.loading}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className={requestStyles.emptyState}>
              <h3>No requests found</h3>
              <p>Create a new request to get started.</p>
            </div>
          ) : (
            <div className={requestStyles.requestsList}>
              {requests.map((request: NecromancyRequest) => (
                <div key={request._id} className={requestStyles.requestCard}>
                  <div className={requestStyles.requestHeader}>
                    <h3>Request #{request._id.slice(-6)}</h3>
                    <span className={`${requestStyles.status} ${getStatusClass(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className={requestStyles.requestDescription}>
                    <p>
                      <strong>Vehicle:</strong> {request.vehicleDescription}
                    </p>
                    <p>
                      <strong>Location:</strong> {request.location.address}
                    </p>
                    <p>{request.description}</p>
                  </div>
                  <div className={requestStyles.requestMeta}>
                    <span>Created: {formatDate(request.createdAt)}</span>
                    {request.status === 'pending' && user?._id === request.userId && (
                      <button
                        className={requestStyles.cancelRequestButton}
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NecromancyRequestsPage; 