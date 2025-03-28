"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import styles from '../../page.module.css';
import authStyles from '../auth.module.css';

interface BackendStatus {
  message: string;
  status: 'checking' | 'success' | 'error';
}

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Default role
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [backendStatus, setBackendStatus] = React.useState<BackendStatus>({ 
    message: 'Checking backend connection...', 
    status: 'checking' 
  });

  React.useEffect(() => {
    // Test the backend connection
    const testBackendConnection = async () => {
      try {
        const response = await fetch('/api/auth');
        if (response.ok) {
          const data = await response.json();
          console.log('Backend connection successful:', data);
          setBackendStatus({ message: 'Backend connected ✅', status: 'success' });
        } else {
          console.error('Backend connection error:', response.statusText);
          setBackendStatus({ 
            message: `Backend error: ${response.status} ${response.statusText}`, 
            status: 'error' 
          });
        }
      } catch (err) {
        console.error('Backend connection failed:', err);
        setBackendStatus({ message: 'Backend connection failed ❌', status: 'error' });
      }
    };

    testBackendConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: "********", // Don't log actual password
        role: formData.role
      });

      const { confirmPassword, ...registrationData } = formData;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('Registration response status:', response.status);
      
      const data = await response.json();
      console.log('Registration response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Something went wrong with registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authStyles.darkContainer}>
      <header className={authStyles.darkHeader}>
        <h1>Project Necromancer</h1>
        <p>Real-time tow truck tracking service</p>
        <Navigation />
      </header>

      <main className={authStyles.authMain}>
        <div className={authStyles.authCard}>
          <h2>Register</h2>
          {backendStatus && (
            <div className={`${authStyles.backendStatus} ${
              backendStatus.status === 'success' 
                ? authStyles.backendStatusSuccess 
                : backendStatus.status === 'error' 
                  ? authStyles.backendStatusError 
                  : ''
            }`}>
              {backendStatus.message}
            </div>
          )}
          {error && <div className={authStyles.error}>{error}</div>}
          <form onSubmit={handleSubmit} className={authStyles.authForm}>
            <div className={authStyles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <button 
              type="submit" 
              className={authStyles.submitButton}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </main>

      <footer className={authStyles.darkFooter}>
        <p>© 2023 Project Necromancer - All rights reserved</p>
      </footer>
    </div>
  );
};

export default RegisterPage; 