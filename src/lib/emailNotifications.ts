/**
 * Email Notification Service
 * Handles sending notifications for new hotel submissions
 */

import { supabase } from './supabase';

/**
 * Send email notification for new hotel submission
 * 
 * IMPORTANT: Email notifications require additional setup:
 * 
 * OPTION 1 - Supabase Edge Function (Recommended):
 * 1. Create a Supabase Edge Function to send emails
 * 2. Use a service like Resend, SendGrid, or Mailgun within the Edge Function
 * 3. Deploy the Edge Function to your Supabase project
 * 4. Uncomment the Edge Function code in this file
 * 
 * OPTION 2 - Database Notifications (Current Implementation):
 * - Stores notifications in the admin_notifications table
 * - Admins can view notifications in their dashboard
 * - No external email service required
 * 
 * OPTION 3 - Third-party API (Alternative):
 * - Call an external email API directly from this function
 * - Note: API keys should never be exposed in client-side code
 * - Consider using a backend proxy or Edge Function instead
 * 
 * @param hotelData - Hotel data to include in notification
 * @returns Success/error response
 */
export const sendNewHotelNotification = async (hotelData: {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  description?: string;
  rating: number;
}) => {
  try {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@safar.pk';
    
    // Get hotel owner details
    const { data: ownerData } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', hotelData.owner_id)
      .single();

    const emailData = {
      to: adminEmail,
      subject: `New Hotel Submission: ${hotelData.name}`,
      hotelName: hotelData.name,
      location: hotelData.location,
      description: hotelData.description || 'No description provided',
      rating: hotelData.rating,
      ownerName: ownerData?.full_name || 'Unknown',
      ownerEmail: ownerData?.email || 'Not provided',
      submittedAt: new Date().toISOString(),
      hotelId: hotelData.id,
    };

    // OPTION 1: Call Supabase Edge Function (requires setup)
    // Uncomment this section if you have an Edge Function deployed
    /*
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'new_hotel_notification',
          ...emailData
        }
      });
      
      if (error) {
        console.error('Error sending email via Edge Function:', error);
        // Fall through to database notification as backup
      } else {
        console.log('✅ Email sent successfully via Edge Function');
        return { success: true, data, method: 'edge_function' };
      }
    } catch (edgeError) {
      console.error('Edge Function invocation failed:', edgeError);
      // Continue to database notification
    }
    */

    // OPTION 2: Store in database for manual review (current implementation)
    // Create a notification record in the database
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([{
        type: 'new_hotel',
        title: `New Hotel: ${hotelData.name}`,
        message: `A new hotel "${hotelData.name}" in ${hotelData.location} has been submitted by ${ownerData?.full_name || 'Unknown'} and is pending approval.`,
        metadata: emailData,
        read: false,
      }]);

    if (error) {
      // If table doesn't exist, just log the notification
      console.log('📧 New Hotel Notification (Console Log):', emailData);
      console.warn('⚠️ Note: admin_notifications table not found. Notification logged to console only.');
      console.info('💡 To enable database notifications, run the admin_notifications migration SQL.');
      return { success: true, logged: true, method: 'console' };
    }

    console.log('✅ Notification stored in database:', data);
    return { success: true, data, method: 'database' };

  } catch (error) {
    console.error('❌ Error sending hotel notification:', error);
    return { success: false, error };
  }
};

/**
 * Get unread admin notifications
 * @returns Array of unread notifications
 */
export const getUnreadNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('admin_notifications table not found or error fetching:', error);
      return { data: [], error: null };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], error };
  }
};

/**
 * Mark notification as read
 * @param notificationId - ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};
