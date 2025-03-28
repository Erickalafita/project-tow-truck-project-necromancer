'use client';

import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    userId: null
  });

  useEffect(() => {
    // Get token from localStorage (in a real app, consider httpOnly cookies)
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decode the token to get the user ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        
        const decoded = JSON.parse(jsonPayload);
        
        setAuth({
          token,
          isAuthenticated: true,
          userId: decoded.userId
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    // Update state
    try {
      // Decode the token to get the user ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      
      setAuth({
        token,
        isAuthenticated: true,
        userId: decoded.userId
      });
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      token: null,
      isAuthenticated: false,
      userId: null
    });
  };

  return {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    userId: auth.userId,
    login,
    logout
  };
}
