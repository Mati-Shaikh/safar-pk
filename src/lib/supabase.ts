import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxttisquctjfzeukypga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dHRpc3F1Y3RqZnpldWt5cGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTgzNTYsImV4cCI6MjA3NDM5NDM1Nn0.1kLdqTJqi20XFwEgfN7nVKpEmUAzk2mXPdxiVn08OVE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true // IMPORTANT: Must be true for password reset to work
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
    console.log('Starting custom signup for:', email || userData.phone_number)

    // Check if user already exists with the same email AND role combination
    if (email) {
      const { data: existingUserByEmailAndRole } = await supabase
        .from('user_profiles')
        .select('email, role')
        .eq('email', email)
        .eq('role', userData.role)
        .single()

      if (existingUserByEmailAndRole) {
        console.log('User with this email and role already exists')
        return {
          data: null,
          error: { message: `An account with this email already exists for ${userData.role} role` }
        }
      }
    }

    // Check if user already exists with the same phone number AND role combination
    if (userData.phone_number) {
      const { data: existingUserByPhoneAndRole } = await supabase
        .from('user_profiles')
        .select('phone_number, role')
        .eq('phone_number', userData.phone_number)
        .eq('role', userData.role)
        .single()

      if (existingUserByPhoneAndRole) {
        console.log('User with this phone number and role already exists')
        return {
          data: null,
          error: { message: `An account with this phone number already exists for ${userData.role} role` }
        }
      }
    }

    // Step 1: Create user in Supabase Auth (for password reset emails to work)
    let userId: string | undefined
    let authError: any = null

    if (email) {
      console.log('📧 Creating user in Supabase Auth with email:', email)
      
      // IMPORTANT: Set skipConfirmation to true to avoid database trigger conflicts
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/reset-password`,
          data: {
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            role: userData.role,
            // Flag to help identify users created via custom signup
            custom_signup: true
          }
        }
      })

      console.log('🔍 Supabase Auth signup response:', { 
        user: authData?.user?.id, 
        session: authData?.session ? 'exists' : 'null',
        error: signUpError 
      })

      if (signUpError) {
        console.error('❌ Supabase Auth signup error:', signUpError)
        console.error('Error details:', signUpError.message)
        
        // If the error is about existing user, that's OK - we'll use user_profiles
        if (signUpError.message?.includes('already registered') || signUpError.message?.includes('User already registered')) {
          console.log('⚠️ User already exists in Auth, continuing with custom profile')
          userId = crypto.randomUUID()
        } else {
          // For other errors (like trigger conflicts), generate UUID and continue
          console.warn('⚠️ Auth signup failed, will use custom auth only (password reset unavailable)')
          authError = signUpError
          userId = crypto.randomUUID()
        }
      } else if (authData.user) {
        userId = authData.user.id
        console.log('✅ User created in Supabase Auth with ID:', userId)
      } else {
        console.warn('⚠️ No user returned from Supabase Auth, generating UUID')
        userId = crypto.randomUUID()
      }
    } else {
      console.log('📱 No email provided, creating phone-only user')
      userId = crypto.randomUUID()
    }

    // Step 2: Create user in user_profiles table (for custom auth)
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email || null,
        full_name: userData.full_name,
        phone_number: userData.phone_number || null,
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

    console.log('✅ User created successfully in user_profiles')

    // Create a mock user object similar to Supabase auth
    const mockUser = {
      id: userId,
      email: email || userData.phone_number,
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

export const customSignIn = async (emailOrPhone: string, password: string, preferredRole?: UserRole) => {
  try {
    console.log('Starting custom signin for:', emailOrPhone, 'with preferred role:', preferredRole)

    // Try to find user by email or phone number
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('password_hash', btoa(password))

    // Check if input looks like email (contains @) or phone
    if (emailOrPhone.includes('@')) {
      query = query.eq('email', emailOrPhone.toLowerCase())
    } else {
      query = query.eq('phone_number', emailOrPhone)
    }

    // If preferred role is provided, filter by it
    if (preferredRole) {
      query = query.eq('role', preferredRole)
    }

    // Fetch results - may return multiple if no role specified
    const { data: results, error } = await query

    if (error || !results || results.length === 0) {
      console.error('Custom signin failed:', error)
      return {
        data: null,
        error: { message: 'Invalid email/phone or password' }
      }
    }

    // If multiple accounts exist and no preferred role specified, pick the first one
    // The UI will validate if it's the correct role for that portal
    const data = results[0]

    console.log('User signed in successfully with role:', data.role)

    // Create a mock user object
    const mockUser = {
      id: data.id,
      email: data.email || data.phone_number,
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

// Password reset functions using Supabase Auth
export const sendPasswordResetEmail = async (email: string, userType: 'customer' | 'partner' = 'customer') => {
  try {
    console.log('Sending password reset email to:', email, 'for user type:', userType)

    // Verify user exists with this email in our custom user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !userProfile) {
      // For security, return success even if user doesn't exist (prevents email enumeration)
      console.log('User not found in profiles, but returning success for security')
      return { error: null }
    }

    // Validate user type matches role
    const allowedRoles = userType === 'partner' 
      ? [UserRole.DRIVER, UserRole.HOTEL_OWNER] 
      : [UserRole.CUSTOMER, UserRole.ADMIN]
    
    if (!allowedRoles.includes(userProfile.role as UserRole)) {
      console.log('User role does not match requested user type')
      // Return success to prevent role enumeration
      return { error: null }
    }

    // Determine the correct redirect URL
    // Always use production URL unless explicitly on localhost
    let redirectUrl = 'https://safarpk.com/reset-password'
    
    // Only use localhost URL when actually on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const port = window.location.port || '5173'
      redirectUrl = `http://localhost:${port}/reset-password`
    }

    console.log('📧 Sending password reset email...')
    console.log('📍 Redirect URL:', redirectUrl)
    console.log('✉️ To:', email)

    // Use Supabase Auth's built-in password reset
    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: redirectUrl,
    })

    console.log('📬 Supabase response:', { data, error: resetError })

    if (resetError) {
      console.error('❌ Supabase password reset error:', resetError)
      // Return error for debugging (in production, you might want to hide this)
      return { error: { message: resetError.message } }
    }

    console.log('✅ Password reset email sent successfully!')
    console.log('⏰ Email will expire in 1 hour')
    console.log('📥 Check inbox and spam folder')
    
    return { error: null }

  } catch (err) {
    console.error('Unexpected error during password reset:', err)
    return { error: { message: 'An unexpected error occurred' } }
  }
}

// Update password using Supabase Auth (called from reset password page)
export const updatePasswordWithSupabase = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      return { error: { message: error.message } }
    }

    console.log('✅ Password updated successfully')
    return { error: null }

  } catch (err) {
    console.error('Unexpected error updating password:', err)
    return { error: { message: 'An unexpected error occurred' } }
  }
}

// Rate limiting for password reset (simple in-memory implementation)
const resetAttempts = new Map<string, { count: number; resetAt: number }>()

export const checkResetRateLimit = (email: string): boolean => {
  const now = Date.now()
  const attempt = resetAttempts.get(email)

  if (!attempt || now > attempt.resetAt) {
    // Reset counter after 15 minutes
    resetAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }

  if (attempt.count >= 3) {
    // Max 3 attempts per 15 minutes
    return false
  }

  attempt.count++
  return true
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

// Hotel management functions
export const createHotel = async (hotelData: {
  owner_id: string
  name: string
  description?: string
  location: string
  amenities: string[]
  images: string[]
}) => {
  const { data, error } = await supabase
    .from('hotels')
    .insert({
      ...hotelData,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

export const getHotelsByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateHotel = async (hotelId: string, updates: {
  name?: string
  description?: string
  location?: string
  amenities?: string[]
  images?: string[]
  rating?: number
}) => {
  const { data, error } = await supabase
    .from('hotels')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', hotelId)
    .select()
    .single()
  return { data, error }
}

export const deleteHotel = async (hotelId: string) => {
  const { data, error } = await supabase
    .from('hotels')
    .delete()
    .eq('id', hotelId)
  return { data, error }
}

// Hotel Room management functions
export const createHotelRoom = async (roomData: {
  hotel_id: string
  type: string
  description?: string
  price_per_night: number
  capacity: number
  amenities: string[]
  images: string[]
  available?: boolean
}) => {
  const { data, error } = await supabase
    .from('hotel_rooms')
    .insert({
      ...roomData,
      available: roomData.available ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

export const getHotelRooms = async (hotelId: string) => {
  const { data, error } = await supabase
    .from('hotel_rooms')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateHotelRoom = async (roomId: string, updates: {
  type?: string
  description?: string
  price_per_night?: number
  capacity?: number
  amenities?: string[]
  images?: string[]
  available?: boolean
}) => {
  const { data, error } = await supabase
    .from('hotel_rooms')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId)
    .select()
    .single()
  return { data, error }
}

export const deleteHotelRoom = async (roomId: string) => {
  const { data, error } = await supabase
    .from('hotel_rooms')
    .delete()
    .eq('id', roomId)
  return { data, error }
}

// Vehicle management functions
export const createVehicle = async (vehicleData: {
  driver_id: string
  name: string
  type: string
  seats: number
  price_per_day: number
  description?: string
  features: string[]
  images: string[]
  available?: boolean
}) => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      ...vehicleData,
      available: vehicleData.available ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

export const getVehiclesByDriver = async (driverId: string) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateVehicle = async (vehicleId: string, updates: {
  name?: string
  type?: string
  seats?: number
  price_per_day?: number
  description?: string
  features?: string[]
  images?: string[]
  available?: boolean
}) => {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', vehicleId)
    .select()
    .single()
  return { data, error }
}

export const deleteVehicle = async (vehicleId: string) => {
  const { data, error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)
  return { data, error }
}

export const toggleVehicleAvailability = async (vehicleId: string, available: boolean) => {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      available,
      updated_at: new Date().toISOString()
    })
    .eq('id', vehicleId)
    .select()
    .single()
  return { data, error }
}

// Booking management functions
export const createBooking = async (bookingData: {
  trip_id: string
  customer_id: string
  provider_id: string
  vehicle_id?: string
  hotel_room_id?: string
  booking_type: 'vehicle' | 'hotel_room'
  start_date: string
  end_date: string
  total_price: number
  status?: string
}) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...bookingData,
      status: bookingData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  return { data, error }
}

export const createVehicleBooking = async (bookingData: {
  trip_id: string
  customer_id: string
  driver_id: string
  vehicle_id: string
  start_date: string
  end_date: string
  total_price: number
}) => {
  return createBooking({
    trip_id: bookingData.trip_id,
    customer_id: bookingData.customer_id,
    provider_id: bookingData.driver_id,
    vehicle_id: bookingData.vehicle_id,
    booking_type: 'vehicle',
    start_date: bookingData.start_date,
    end_date: bookingData.end_date,
    total_price: bookingData.total_price
  })
}

export const createRoomBooking = async (bookingData: {
  trip_id: string
  customer_id: string
  hotel_id: string
  hotel_room_id: string
  start_date: string
  end_date: string
  total_price: number
}) => {
  return createBooking({
    trip_id: bookingData.trip_id,
    customer_id: bookingData.customer_id,
    provider_id: bookingData.hotel_id,
    hotel_room_id: bookingData.hotel_room_id,
    booking_type: 'hotel_room',
    start_date: bookingData.start_date,
    end_date: bookingData.end_date,
    total_price: bookingData.total_price
  })
}

export const getBookingsByTrip = async (tripId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getBookingsByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getBookingsByProvider = async (providerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', providerId)
    .order('start_date', { ascending: true })
  return { data, error }
}

export const getVehicleBookingsByDriver = async (driverId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', driverId)
    .eq('booking_type', 'vehicle')
    .order('start_date', { ascending: true })
  return { data, error }
}

export const getHotelBookingsByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', ownerId)
    .eq('booking_type', 'hotel_room')
    .order('start_date', { ascending: true })
  return { data, error }
}

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single()
  return { data, error }
}

export const deleteBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
  return { data, error }
}

// Helper function to get vehicle driver/owner ID
export const getVehicleOwnerId = async (vehicleId: string) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('driver_id')
    .eq('id', vehicleId)
    .single()

  if (error) {
    console.error('Error fetching vehicle owner:', error)
    return { data: null, error }
  }

  return { data: data?.driver_id || null, error: null }
}

// Helper function to get hotel owner ID
export const getHotelOwnerId = async (hotelId: string) => {
  const { data, error } = await supabase
    .from('hotels')
    .select('owner_id')
    .eq('id', hotelId)
    .single()

  if (error) {
    console.error('Error fetching hotel owner:', error)
    return { data: null, error }
  }

  return { data: data?.owner_id || null, error: null }
}

// Helper function to get hotel owner ID from room ID
export const getHotelOwnerIdFromRoom = async (roomId: string) => {
  const { data, error } = await supabase
    .from('hotel_rooms')
    .select('hotel_id, hotels(owner_id)')
    .eq('id', roomId)
    .single()

  if (error) {
    console.error('Error fetching hotel owner from room:', error)
    return { data: null, error }
  }

  // Extract owner_id from nested hotels object
  const ownerId = (data as any)?.hotels?.owner_id || null
  return { data: ownerId, error: null }
}

// Helper function to create multiple bookings from trip itinerary
export const createBookingsFromItinerary = async (
  tripId: string,
  customerId: string,
  itinerary: any[]
) => {
  const bookings = []
  const errors = []

  for (const day of itinerary) {
    const dayDate = day.date

    for (const slot of day.slots) {
      // Create vehicle booking if transport is needed
      if (slot.transportNeeded && slot.selectedCar?.id) {
        try {
          // Get vehicle owner ID
          const { data: driverId, error: driverError } = await getVehicleOwnerId(slot.selectedCar.id)

          if (driverError || !driverId) {
            errors.push({
              type: 'vehicle',
              slot: slot.id,
              error: 'Failed to get vehicle owner ID'
            })
            continue
          }

          // Get dynamic price based on booking date
          const { data: dynamicPrice } = await getVehicleCurrentPrice(slot.selectedCar.id, dayDate);
          
          // Parse fallback price from string like "PKR 8,000"
          const priceMatch = slot.selectedCar.pricePerDay.match(/[\d,]+/)
          const fallbackPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0
          
          // Use dynamic price if available, otherwise use fallback
          const pricePerDay = dynamicPrice !== null ? dynamicPrice : fallbackPrice

          // Create vehicle booking
          const { data, error } = await createBooking({
            trip_id: tripId,
            customer_id: customerId,
            provider_id: driverId,
            vehicle_id: slot.selectedCar.id,
            booking_type: 'vehicle',
            start_date: `${dayDate}T${slot.startTime}:00`,
            end_date: `${dayDate}T${slot.endTime}:00`,
            total_price: pricePerDay,
            status: 'pending'
          })

          if (error) {
            errors.push({
              type: 'vehicle',
              slot: slot.id,
              error: error.message
            })
          } else {
            bookings.push(data)
          }
        } catch (err) {
          console.error('Error creating vehicle booking:', err)
          errors.push({
            type: 'vehicle',
            slot: slot.id,
            error: 'Unexpected error creating vehicle booking'
          })
        }
      }

      // Create hotel room booking if hotel is needed
      if (slot.hotelRoomNeeded && slot.selectedRoom?.id) {
        try {
          // Get hotel owner ID from room
          const { data: hotelOwnerId, error: ownerError } = await getHotelOwnerIdFromRoom(slot.selectedRoom.id)

          if (ownerError || !hotelOwnerId) {
            errors.push({
              type: 'hotel',
              slot: slot.id,
              error: 'Failed to get hotel owner ID'
            })
            continue
          }

          // Get dynamic price based on booking date
          const { data: dynamicPrice } = await getRoomCurrentPrice(slot.selectedRoom.id, dayDate);
          
          // Parse fallback price from string like "PKR 25,000"
          const priceMatch = slot.selectedRoom.price.match(/[\d,]+/)
          const fallbackPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0
          
          // Use dynamic price if available, otherwise use fallback
          const pricePerNight = dynamicPrice !== null ? dynamicPrice : fallbackPrice

          // Hotel bookings typically span overnight, so we use the full day
          const { data, error } = await createBooking({
            trip_id: tripId,
            customer_id: customerId,
            provider_id: hotelOwnerId,
            hotel_room_id: slot.selectedRoom.id,
            booking_type: 'hotel_room',
            start_date: `${dayDate}T${slot.startTime}:00`,
            end_date: `${dayDate}T23:59:59`, // End of day for hotel bookings
            total_price: pricePerNight,
            status: 'pending'
          })

          if (error) {
            errors.push({
              type: 'hotel',
              slot: slot.id,
              error: error.message
            })
          } else {
            bookings.push(data)
          }
        } catch (err) {
          console.error('Error creating hotel booking:', err)
          errors.push({
            type: 'hotel',
            slot: slot.id,
            error: 'Unexpected error creating hotel booking'
          })
        }
      }
    }
  }

  return {
    bookings,
    errors,
    success: errors.length === 0
  }
}

// =============================================
// PRICING FUNCTIONS
// =============================================

// Hotel Room Pricing Functions
export const createOrUpdateRoomPricing = async (pricingData: {
  room_id: string;
  off_season_months?: number[];
  off_season_price?: number | null;
  on_season_months?: number[];
  on_season_price?: number | null;
  closed_months?: number[];
  last_minute_enabled?: boolean;
  last_minute_days_before?: number | null;
  last_minute_discount_price?: number | null;
}) => {
  try {
    // Check if pricing already exists
    const { data: existing } = await supabase
      .from('hotel_room_pricing')
      .select('id')
      .eq('room_id', pricingData.room_id)
      .single();

    if (existing) {
      // Update existing pricing
      const { data, error } = await supabase
        .from('hotel_room_pricing')
        .update({
          off_season_months: pricingData.off_season_months || [],
          off_season_price: pricingData.off_season_price,
          on_season_months: pricingData.on_season_months || [],
          on_season_price: pricingData.on_season_price,
          closed_months: pricingData.closed_months || [],
          last_minute_enabled: pricingData.last_minute_enabled || false,
          last_minute_days_before: pricingData.last_minute_days_before,
          last_minute_discount_price: pricingData.last_minute_discount_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      return { data, error };
    } else {
      // Create new pricing
      const { data, error } = await supabase
        .from('hotel_room_pricing')
        .insert({
          room_id: pricingData.room_id,
          off_season_months: pricingData.off_season_months || [],
          off_season_price: pricingData.off_season_price,
          on_season_months: pricingData.on_season_months || [],
          on_season_price: pricingData.on_season_price,
          closed_months: pricingData.closed_months || [],
          last_minute_enabled: pricingData.last_minute_enabled || false,
          last_minute_days_before: pricingData.last_minute_days_before,
          last_minute_discount_price: pricingData.last_minute_discount_price
        })
        .select()
        .single();

      return { data, error };
    }
  } catch (error) {
    console.error('Error creating/updating room pricing:', error);
    return { data: null, error };
  }
};

export const getRoomPricing = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('hotel_room_pricing')
      .select('*')
      .eq('room_id', roomId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching room pricing:', error);
    return { data: null, error };
  }
};

export const deleteRoomPricing = async (roomId: string) => {
  try {
    const { error } = await supabase
      .from('hotel_room_pricing')
      .delete()
      .eq('room_id', roomId);

    return { error };
  } catch (error) {
    console.error('Error deleting room pricing:', error);
    return { error };
  }
};

// Vehicle Pricing Functions
export const createOrUpdateVehiclePricing = async (pricingData: {
  vehicle_id: string;
  off_season_months?: number[];
  off_season_price?: number | null;
  on_season_months?: number[];
  on_season_price?: number | null;
  closed_months?: number[];
  last_minute_enabled?: boolean;
  last_minute_days_before?: number | null;
  last_minute_discount_price?: number | null;
}) => {
  try {
    // Check if pricing already exists
    const { data: existing } = await supabase
      .from('vehicle_pricing')
      .select('id')
      .eq('vehicle_id', pricingData.vehicle_id)
      .single();

    if (existing) {
      // Update existing pricing
      const { data, error } = await supabase
        .from('vehicle_pricing')
        .update({
          off_season_months: pricingData.off_season_months || [],
          off_season_price: pricingData.off_season_price,
          on_season_months: pricingData.on_season_months || [],
          on_season_price: pricingData.on_season_price,
          closed_months: pricingData.closed_months || [],
          last_minute_enabled: pricingData.last_minute_enabled || false,
          last_minute_days_before: pricingData.last_minute_days_before,
          last_minute_discount_price: pricingData.last_minute_discount_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      return { data, error };
    } else {
      // Create new pricing
      const { data, error } = await supabase
        .from('vehicle_pricing')
        .insert({
          vehicle_id: pricingData.vehicle_id,
          off_season_months: pricingData.off_season_months || [],
          off_season_price: pricingData.off_season_price,
          on_season_months: pricingData.on_season_months || [],
          on_season_price: pricingData.on_season_price,
          closed_months: pricingData.closed_months || [],
          last_minute_enabled: pricingData.last_minute_enabled || false,
          last_minute_days_before: pricingData.last_minute_days_before,
          last_minute_discount_price: pricingData.last_minute_discount_price
        })
        .select()
        .single();

      return { data, error };
    }
  } catch (error) {
    console.error('Error creating/updating vehicle pricing:', error);
    return { data: null, error };
  }
};

export const getVehiclePricing = async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicle_pricing')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching vehicle pricing:', error);
    return { data: null, error };
  }
};

export const deleteVehiclePricing = async (vehicleId: string) => {
  try {
    const { error } = await supabase
      .from('vehicle_pricing')
      .delete()
      .eq('vehicle_id', vehicleId);

    return { error };
  } catch (error) {
    console.error('Error deleting vehicle pricing:', error);
    return { error };
  }
};

// Get current price for a room based on date
export const getRoomCurrentPrice = async (roomId: string, bookingDate?: string) => {
  try {
    const date = bookingDate || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .rpc('get_room_current_price', {
        p_room_id: roomId,
        p_booking_date: date
      });

    return { data, error };
  } catch (error) {
    console.error('Error fetching room current price:', error);
    return { data: null, error };
  }
};

// Get current price for a vehicle based on date
export const getVehicleCurrentPrice = async (vehicleId: string, bookingDate?: string) => {
  try {
    const date = bookingDate || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .rpc('get_vehicle_current_price', {
        p_vehicle_id: vehicleId,
        p_booking_date: date
      });

    return { data, error };
  } catch (error) {
    console.error('Error fetching vehicle current price:', error);
    return { data: null, error };
  }
};