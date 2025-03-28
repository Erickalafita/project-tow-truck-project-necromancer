"use client";

import React from 'react';
const { useState, useEffect } = React;
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';

interface DriverProfile {
  skills: string[];
  bio: string;
  profilePicture: string;
}

const DriverProfilePage = () => {
  const [driverData, setDriverData] = useState<DriverProfile>({
    skills: [],
    bio: '',
    profilePicture: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const { token } = useAuth();
  const router = useRouter();

  const serviceOptions = [
    "Light-Duty Towing",
    "Medium-Duty Towing",
    "Heavy-Duty Towing",
    "Motorcycle Towing",
    "Emergency Towing Services",
    "Roadside Assistance",
    "Lockouts",
    "Jump Starts",
    "Tire Changes",
    "Fuel Delivery",
    "Long Distance Towing",
    "Flatbed Towing",
    "Lowboy Towing",
    "Specialty Lifts",
    "Crane Services",
    "Ignition Key Solutions",
    "Professional Heavy Duty Tire Change"
  ];

  useEffect(() => {
    if (!token) return;

    const fetchUserAndProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const decodedToken = verifyToken(token);
        if (!decodedToken || !decodedToken.userId) {
          throw new Error('Invalid or missing user ID in token');
        }

        setUserId(decodedToken.userId);
        console.log("user id: ", decodedToken.userId)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/${decodedToken.userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDriverData(data);
        setSkills(data.skills);
        setBio(data.bio);
        setProfilePicture(data.profilePicture);
      } catch (error: any) {
        console.error("Could not fetch driver profile", error);
        setError(error.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [token]);

  const handleSkillChange = (skill: string) => {
    setSkills((prevSkills: string[]) => {
      if (prevSkills.includes(skill)) {
        return prevSkills.filter((s: string) => s !== skill);
      } else {
        return [...prevSkills, skill];
      }
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfilePicture(data.fileUrl);
    } catch (error: any) {
      console.error("Could not upload profile picture", error);
      setError(error.message || "Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/driver/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills: skills,
          bio: bio,
          profilePicture: profilePicture
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle successful update
      console.log("Driver profile updated successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Could not update driver profile", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return (
        <div>Loading...</div>
    )
  }

  return (
    <div>
      <h1>Driver Profile</h1>
      {error && <div className="error-message">{error}</div>}
      <div>
        <label htmlFor="skills">Skills:</label>
        {serviceOptions.map((option) => (
          <div key={option}>
            <label>
              <input
                type="checkbox"
                value={option}
                checked={skills.includes(option)}
                onChange={() => handleSkillChange(option)}
              />
              {option}
            </label>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={handleBioChange}
        />
      </div>

      <div>
        <label htmlFor="profilePicture">Profile Picture:</label>
        <input
          type="file"
          id="profilePicture"
          onChange={handleProfilePictureChange}
        />
        {uploading && <p>Uploading picture</p>}
        {profilePicture && (
          <img src={profilePicture} alt="Profile" style={{ maxWidth: '200px' }} />
        )}
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
};

export default DriverProfilePage;