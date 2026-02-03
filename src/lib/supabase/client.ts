import { createClient } from '@supabase/supabase-js';

// Use fallback values during build time to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with fallback values (will be properly initialized at runtime)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

export type Booking = {
    id: string;
    resource_type: 'venue' | 'bus' | 'turf';
    resource_id: string | null;
    resource_name: string;
    sub_area: string | null;
    facility: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    selected_slots: string[];
    duration_type: 'custom' | 'full-day';
    attendees: number;
    event_title: string;
    event_description: string;
    department_category: string;
    department: string;
    faculty_incharge: string;
    contact_number: string;
    contact_email: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    requester_id: string;
    requester_name: string;
    requester_email: string;
    reviewed_at?: string;
    reviewed_by?: string;
    created_at?: string;
    updated_at?: string;
};

export type Notification = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    created_at: string;
    booking_id?: string;
};
