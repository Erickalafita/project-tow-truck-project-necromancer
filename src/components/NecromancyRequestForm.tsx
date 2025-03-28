"use client";

import React from 'react';
const { useState } = React;
import { useAuth } from '@/hooks/useAuth'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
  });

interface NecromancyRequestFormProps {
  onSuccess: () => void;
}

const NecromancyRequestForm: React.FC<NecromancyRequestFormProps> = ({ onSuccess }) => {
  const [location, setLocation] = useState<{ type: string; coordinates: [number, number] }>({
    type: 'Point',
    coordinates: [0, 0], // Default coordinates
  });
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!location.coordinates[0] || !location.coordinates[1]) {
      setError('Please select a location on the map.');
      return;
    }

    if (!serviceType) {
      setError('Please select a service type.');
      return;
    }

    try {
      const response = await fetch('/api/necromancy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          serviceType,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create request');
        return;
      }

      onSuccess(); // Callback to refresh the request list
      router.push('/necromancy-requests');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const serviceOptions = [
    'Light-Duty Towing',
    'Medium-Duty Towing',
    'Heavy-Duty Towing',
    'Motorcycle Towing',
    'Emergency Towing Services',
    'Roadside Assistance',
    'Lockouts',
    'Jump Starts',
    'Tire Changes',
    'Fuel Delivery',
    'Long Distance Towing',
    'Flatbed Towing',
    'Lowboy Towing',
    'Specialty Lifts',
    'Crane Services',
    'Ignition Key Solutions',
    'Professional Heavy Duty Tire Change'
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
          Location:
        </label>
        <Map setLocation={setLocation} />
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="serviceType" className="block text-gray-700 text-sm font-bold mb-2">
          Service Type:
        </label>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${serviceType === option ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setServiceType(option)}
              disabled={serviceType === option}
            >
              {option}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Description:
        </label>
        <textarea
          id="description"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
};

export default NecromancyRequestForm; 