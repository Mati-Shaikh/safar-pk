import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserData(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to fetch user data from the appropriate table based on role
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (customerData) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: customerData.name,
          role: 'customer',
          phone: customerData.phone,
          address: customerData.address,
          createdAt: customerData.created_at
        });
        return;
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (adminData) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: adminData.name,
          role: 'admin',
          phone: adminData.phone,
          address: adminData.address,
          createdAt: adminData.created_at
        });
        return;
      }

      const { data: hotelData } = await supabase
        .from('hotel_managers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (hotelData) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: hotelData.name,
          role: 'hotel',
          phone: hotelData.phone,
          address: hotelData.address,
          createdAt: hotelData.created_at
        });
        return;
      }

      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (driverData) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: driverData.name,
          role: 'driver',
          phone: driverData.phone,
          address: driverData.address,
          createdAt: driverData.created_at
        });
        return;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await fetchUserData(data.user);
        setIsLoading(false);
        return true;
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
      // First, sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error('Registration error:', error);
        setIsLoading(false);
        return false;
      }

      if (!data.user) {
        setIsLoading(false);
        return false;
      }

      // Insert user data into the appropriate table based on role
      let insertError;
      switch (userData.role) {
        case 'customer':
          const { error: customerError } = await supabase
            .from('customers')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
            });
          insertError = customerError;
          break;

        case 'admin':
          const { error: adminError } = await supabase
            .from('admins')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
            });
          insertError = adminError;
          break;

        case 'hotel':
          const { error: hotelError } = await supabase
            .from('hotel_managers')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
            });
          insertError = hotelError;
          break;

        case 'driver':
          const { error: driverError } = await supabase
            .from('drivers')
            .insert({
              id: data.user.id,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
            });
          insertError = driverError;
          break;
      }

      if (insertError) {
        console.error('Error inserting user data:', insertError);
        // If insertion fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        setIsLoading(false);
        return false;
      }

      // Fetch the user data to set the user state
      await fetchUserData(data.user);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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