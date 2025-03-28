"use client";

import React from 'react';
const { useState, useEffect } = React;
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NecromancyRequestForm from '@/components/NecromancyRequestForm';

interface NecromancyRequest {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  serviceType: string;
  status: string;
  description: string;
  createdAt: string;
  driverId?: string;
}

export default function NecromancyRequests() {
  const [requests, setRequests] = useState<NecromancyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const fetchRequests = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/necromancy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token, router]);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchRequests();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Necromancy Requests</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="mb-6">
        {showForm ? (
          <div>
            <button 
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded mb-4"
            >
              Cancel
            </button>
            <NecromancyRequestForm onSuccess={handleFormSuccess} />
          </div>
        ) : (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Request
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-4">No requests found. Create one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div key={request._id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{request.serviceType}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  request.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                  request.status === 'accepted' ? 'bg-blue-200 text-blue-800' :
                  request.status === 'in_progress' ? 'bg-orange-200 text-orange-800' :
                  request.status === 'completed' ? 'bg-green-200 text-green-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Created: {formatDate(request.createdAt)}
              </p>
              
              {request.description && (
                <p className="text-sm mb-2">{request.description}</p>
              )}
              
              <div className="text-right mt-4">
                <Link 
                  href={`/necromancy-requests/${request._id}`}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 