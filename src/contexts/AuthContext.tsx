import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    role: User['role'];
  }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user data on app start
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('safarPk_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('safarPk_user');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Helper function to save user to localStorage
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('safarPk_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  // Helper function to clear user from localStorage
  const clearUserFromStorage = () => {
    try {
      localStorage.removeItem('safarPk_user');
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('safarPk_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email === email) {
          // For demo purposes, we'll accept any password
          // In a real app, you'd want to hash and compare passwords
          setUser(userData);
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    role: User['role'];
  }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const existingUser = localStorage.getItem('safarPk_user');
      if (existingUser) {
        const parsedUser = JSON.parse(existingUser);
        if (parsedUser.email === userData.email) {
          setIsLoading(false);
          return false; // User already exists
        }
      }

      // Create new user object
      const newUser: User = {
        id: Date.now().toString(), // Simple ID generation for demo
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      saveUserToStorage(newUser);
      setUser(newUser);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    try {
      clearUserFromStorage();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};