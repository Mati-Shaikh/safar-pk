import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, getCurrentUser, signOut } from '@/lib/supabase';

// Custom user interface for our auth system
interface CustomUser {
  id: string;
  email: string;
  user_metadata?: any;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get user from localStorage (custom auth)
      const { user } = await getCurrentUser();
      setUser(user);

      // Get profile from localStorage
      const profileStr = localStorage.getItem('safar_profile');
      const userProfile = profileStr ? JSON.parse(profileStr) : null;
      setProfile(userProfile);

    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();

    // Listen for storage changes (for cross-tab auth sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'safar_user' || e.key === 'safar_profile') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshAuth = async () => {
    await loadUserData();
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    refreshAuth,
    isAuthenticated: !!user,
    isCustomer: profile?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};