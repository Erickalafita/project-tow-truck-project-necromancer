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

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending login data:', { email, password: "********" });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong with login');
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
          <h2>Login</h2>
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
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className={authStyles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button 
              type="submit" 
              className={authStyles.submitButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
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

export default LoginPage; 