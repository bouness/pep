'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// SHA256 hash of the password (stored securely - this is NOT the password)
const PASSWORD_HASH = 'cdb4ee2aea69cc6a83331bbe96dc2caa9a299d21329efb0336fc02a82e1839a8';

const AUTH_STORAGE_KEY = 'pe-structural-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hash function using Web Crypto API
async function sha256(message: string): Promise<string> {
  // Encode the message as a Uint8Array
  const msgBuffer = new TextEncoder().encode(message);
  
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const authData = JSON.parse(stored);
          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - authData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (sessionAge < maxAge && authData.authenticated === true) {
            setIsAuthenticated(true);
          } else {
            // Session expired, clear it
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const inputHash = await sha256(password);
      
      if (inputHash === PASSWORD_HASH) {
        // Save authentication state to localStorage
        const authData = {
          authenticated: true,
          timestamp: Date.now(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}