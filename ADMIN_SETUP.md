# SAFARPk Admin Panel Setup Guide

## Overview
This comprehensive admin panel provides full CRUD operations for managing all aspects of the SAFARPk platform including users, vehicles, hotels, rooms, destinations, and bookings.

## Database Setup

### 1. Run the Complete SQL Schema
Execute the `complete-admin-schema.sql` file in your Supabase SQL Editor. This will create all necessary tables with proper relationships and Row Level Security (RLS) policies.

### 2. Tables Created
- **user_profiles**: Main user table with roles (customer, driver, hotel, admin)
- **destinations**: Tourist destinations with attractions and popularity ratings
- **hotels**: Hotel information with amenities and ratings
- **hotel_rooms**: Room types and pricing for each hotel
- **vehicles**: Driver vehicles with features and availability
- **trips**: Customer trip planning and bookings
- **bookings**: Hotel and transportation bookings

### 3. Sample Data
The schema includes sample destinations and an admin user for testing.

## Admin Panel Features

### 1. Overview Dashboard
- **Real-time Statistics**: Total users, destinations, hotels, vehicles, trips, bookings
- **Revenue Tracking**: Total revenue from confirmed bookings
- **User Distribution**: Breakdown by role (customers, drivers, hotels, admins)
- **Booking Status**: Pending vs confirmed bookings
- **Recent Activity**: Latest platform activities

### 2. User Management
- **View All Users**: Complete list with search and filtering
- **Add Users**: Create new users with any role
- **Edit Users**: Update user information and roles
- **Delete Users**: Remove users from the platform
- **Role Management**: Assign customer, driver, hotel, or admin roles

### 3. Vehicle Management
- **View All Vehicles**: List all vehicles with driver information
- **Add Vehicles**: Create new vehicles with features and images
- **Edit Vehicles**: Update vehicle details and availability
- **Delete Vehicles**: Remove vehicles from the platform
- **Driver Assignment**: Assign vehicles to specific drivers

### 4. Hotel Management
- **Hotel Management**: Add, edit, and delete hotels
- **Room Management**: Manage room types and pricing for each hotel
- **Owner Assignment**: Assign hotels to hotel owners
- **Amenities Management**: Add and manage hotel amenities
- **Image Management**: Handle hotel and room images

### 5. Destination Management
- **View Destinations**: List all tourist destinations
- **Add Destinations**: Create new destinations with attractions
- **Edit Destinations**: Update destination information
- **Delete Destinations**: Remove destinations from the platform
- **Attractions Management**: Add and manage tourist attractions
- **Popularity Tracking**: Set and track destination popularity

### 6. Booking Management
- **View All Bookings**: Monitor all platform bookings
- **Booking Status**: Track pending, confirmed, and completed bookings
- **Revenue Tracking**: Monitor booking revenue

## Admin Panel Components

### Core Components
- `AdminStats.tsx`: Overview dashboard with statistics
- `UserManagement.tsx`: Complete user CRUD operations
- `VehicleManagement.tsx`: Vehicle management with driver assignment
- `HotelManagement.tsx`: Hotel and room management
- `DestinationManagement.tsx`: Destination and attraction management

### Features
- **Search and Filtering**: All management sections include search functionality
- **Real-time Updates**: Data refreshes automatically after operations
- **Error Handling**: Comprehensive error handling with toast notifications
- **Responsive Design**: Mobile-friendly interface
- **Role-based Access**: Admin-only operations with proper security

## Security Features

### Row Level Security (RLS)
- **Admin Access**: Admins can view and manage all data
- **User Privacy**: Users can only access their own data
- **Role-based Permissions**: Different access levels for different roles

### Data Validation
- **Input Validation**: All forms include proper validation
- **Type Safety**: TypeScript interfaces ensure data consistency
- **Error Handling**: Graceful error handling throughout the application

## Usage Instructions

### 1. Access Admin Panel
- Login as an admin user
- Navigate to the Admin Dashboard
- Use the tabbed interface to access different management sections

### 2. Managing Users
- Go to the "Users" tab
- Use the search bar to find specific users
- Click "Add User" to create new users
- Use edit/delete buttons for existing users

### 3. Managing Vehicles
- Go to the "Vehicles" tab
- View all vehicles with driver information
- Add new vehicles and assign to drivers
- Edit vehicle details and availability

### 4. Managing Hotels
- Go to the "Hotels" tab
- Switch between "Hotels" and "Rooms" sub-tabs
- Add hotels and assign to hotel owners
- Manage room types and pricing

### 5. Managing Destinations
- Go to the "Destinations" tab
- Add new tourist destinations
- Manage attractions and popularity ratings
- Edit destination information

## Database Queries

### Sample Queries for Testing

```sql
-- Get all users with their roles
SELECT id, name, email, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- Get hotel statistics
SELECT 
  COUNT(*) as total_hotels,
  AVG(rating) as avg_rating,
  COUNT(DISTINCT owner_id) as unique_owners
FROM hotels;

-- Get booking revenue by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_bookings,
  SUM(total_price) as revenue
FROM bookings 
WHERE status = 'confirmed'
GROUP BY month
ORDER BY month DESC;

-- Get popular destinations
SELECT name, region, popularity, attractions
FROM destinations 
ORDER BY popularity DESC 
LIMIT 10;
```

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure RLS policies are properly set up
2. **Data Not Loading**: Check Supabase connection and API endpoints
3. **Form Validation**: Ensure all required fields are filled
4. **Image Uploads**: Verify image URLs are accessible

### Support
- Check browser console for error messages
- Verify Supabase connection settings
- Ensure all dependencies are installed
- Check network connectivity

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select and manage multiple items at once
- **Export Functionality**: Export data to CSV/Excel
- **Advanced Analytics**: Detailed reporting and charts
- **Audit Logs**: Track all admin actions
- **Email Notifications**: Notify users of important changes
- **Backup Management**: Database backup and restore functionality

This admin panel provides a complete solution for managing the SAFARPk platform with full CRUD operations, real-time statistics, and comprehensive user management capabilities.

