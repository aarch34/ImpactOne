import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Booking = {
    id: string;
    resource_type: 'venue' | 'bus';
    resource_id: string;
    resource_name: string;
    booking_date: string;
    attendees: number;
    event_title: string;
    event_description: string;
    department: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requester_id: string;
    requester_name: string;
    reviewed_at?: string;
    reviewed_by?: string;
    created_at: string;
    updated_at: string;
};
