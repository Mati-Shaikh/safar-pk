import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxttisquctjfzeukypga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dHRpc3F1Y3RqZnpldWt5cGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTgzNTYsImV4cCI6MjA3NDM5NDM1Nn0.1kLdqTJqi20XFwEgfN7nVKpEmUAzk2mXPdxiVn08OVE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
})

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    console.log('Connection test result:', { data, error })
    return { success: !error, error }
  } catch (err) {
    console.error('Connection test failed:', err)
    return { success: false, error: err }
  }
}

// User roles enum
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  DRIVER = 'driver',
  HOTEL_OWNER = 'hotel_owner'
}

// User profile interface
export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number?: string
  role: UserRole
  avatar_url?: string
  password_hash?: string
  created_at: string
  updated_at: string
}

// Auth helper functions
// Custom auth system that bypasses Supabase auth completely
export const customSignUp = async (email: string, password: string, userData: {
  full_name: string
  phone_number?: string
  role: UserRole
}) => {
  try {
    console.log('Starting custom signup for:', email)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('User already exists')
      return {
        data: null,
        error: { message: 'User with this email already exists' }
      }
    }

    // Create user directly in user_profiles table
    const userId = crypto.randomUUID()
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        role: userData.role,
        password_hash: btoa(password), // Simple base64 encoding (in production, use proper hashing)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Custom signup failed:', error)
      return { data: null, error }
    }

    console.log('User created successfully with custom auth')

    // Create a mock user object similar to Supabase auth
    const mockUser = {
      id: userId,
      email: email,
      user_metadata: userData
    }

    return {
      data: { user: mockUser },
      error: null
    }

  } catch (err) {
    console.error('Unexpected error during custom signup:', err)
    return {
      data: null,
      error: { message: 'Unexpected error during signup' }
    }
  }
}

export const customSignIn = async (email: string, password: string) => {
  try {
    console.log('Starting custom signin for:', email)

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .eq('password_hash', btoa(password))
      .single()

    if (error || !data) {
      console.error('Custom signin failed:', error)
      return {
        data: null,
        error: { message: 'Invalid email or password' }
      }
    }

    console.log('User signed in successfully')

    // Create a mock user object
    const mockUser = {
      id: data.id,
      email: data.email,
      user_metadata: {
        full_name: data.full_name,
        role: data.role
      }
    }

    // Store session in localStorage
    localStorage.setItem('safar_user', JSON.stringify(mockUser))
    localStorage.setItem('safar_profile', JSON.stringify(data))

    return {
      data: { user: mockUser },
      error: null
    }

  } catch (err) {
    console.error('Unexpected error during custom signin:', err)
    return {
      data: null,
      error: { message: 'Unexpected error during signin' }
    }
  }
}

export const customSignOut = async () => {
  localStorage.removeItem('safar_user')
  localStorage.removeItem('safar_profile')
  return { error: null }
}

export const customGetCurrentUser = async () => {
  const userStr = localStorage.getItem('safar_user')
  const user = userStr ? JSON.parse(userStr) : null
  return { user, error: null }
}

// Use custom auth system
export const signUp = customSignUp
export const signIn = customSignIn
export const signOut = customSignOut
export const getCurrentUser = customGetCurrentUser

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Create profile for existing auth users who don't have profiles
export const createMissingProfile = async (userId: string, userData: {
  email: string
  full_name: string
  phone_number?: string
  role: UserRole
}) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email: userData.email,
      full_name: userData.full_name,
      phone_number: userData.phone_number,
      role: userData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  return { data, error }
} 