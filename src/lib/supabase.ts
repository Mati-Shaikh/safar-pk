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
    console.log('Starting custom signup for:', email || userData.phone_number)

    // Check if user already exists by email or phone
    if (email) {
      const { data: existingUserByEmail } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (existingUserByEmail) {
        console.log('User with this email already exists')
        return {
          data: null,
          error: { message: 'User with this email already exists' }
        }
      }
    }

    if (userData.phone_number) {
      const { data: existingUserByPhone } = await supabase
        .from('user_profiles')
        .select('phone_number')
        .eq('phone_number', userData.phone_number)
        .single()

      if (existingUserByPhone) {
        console.log('User with this phone number already exists')
        return {
          data: null,
          error: { message: 'User with this phone number already exists' }
        }
      }
    }

    // Create user directly in user_profiles table
    const userId = crypto.randomUUID()
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

    console.log('User created successfully with custom auth')

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

export const customSignIn = async (emailOrPhone: string, password: string) => {
  try {
    console.log('Starting custom signin for:', emailOrPhone)

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

    const { data, error } = await query.single()

    if (error || !data) {
      console.error('Custom signin failed:', error)
      return {
        data: null,
        error: { message: 'Invalid email/phone or password' }
      }
    }

    console.log('User signed in successfully')

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

          // Parse price from string like "PKR 8,000"
          const priceMatch = slot.selectedCar.pricePerDay.match(/[\d,]+/)
          const pricePerDay = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0

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

          // Parse price from string like "PKR 25,000"
          const priceMatch = slot.selectedRoom.price.match(/[\d,]+/)
          const pricePerNight = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0

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