-- ============================================
-- ImpactOne Booking System - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing tables if you want to recreate (CAREFUL: This deletes all data!)
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.bookings CASCADE;

-- ============================================
-- TABLE: bookings
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_type text NOT NULL CHECK (resource_type = ANY (ARRAY['venue'::text, 'bus'::text, 'turf'::text])),
  resource_id text NOT NULL,
  resource_name text NOT NULL,
  sub_area text,
  facility text,
  booking_date timestamp with time zone NOT NULL,
  start_time text,
  end_time text,
  selected_slots text[],
  duration_type text CHECK (duration_type = ANY (ARRAY['custom'::text, 'full-day'::text])),
  event_title text NOT NULL,
  event_description text NOT NULL,
  attendees integer NOT NULL CHECK (attendees >= 0),
  department text NOT NULL,
  department_category text,
  requester_id text NOT NULL,
  requester_name text NOT NULL,
  requester_email text,
  faculty_incharge text,
  contact_email text,
  contact_number text,
  status text NOT NULL CHECK (status = ANY (ARRAY['Pending'::text, 'Approved'::text, 'Rejected'::text, 'Cancelled'::text])),
  reviewed_at timestamp with time zone,
  reviewed_by text,
  cancellation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id)
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info'::text CHECK (type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text])),
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  booking_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES (for better performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_requester_id ON public.bookings(requester_id);
CREATE INDEX IF NOT EXISTS idx_bookings_requester_email ON public.bookings(requester_email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for bookings
-- ============================================

-- Allow all users to read all bookings (for calendar view)
CREATE POLICY "Allow public read access to bookings"
  ON public.bookings
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own bookings
CREATE POLICY "Allow authenticated users to create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid()::text = requester_id);

-- Allow users to update their own pending bookings
CREATE POLICY "Allow users to update own pending bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid()::text = requester_id AND status = 'Pending')
  WITH CHECK (auth.uid()::text = requester_id);

-- Allow admins to update all bookings (you need to create a custom admin check)
CREATE POLICY "Allow admins to update all bookings"
  ON public.bookings
  FOR UPDATE
  USING (true)  -- Replace with your admin check
  WITH CHECK (true);

-- ============================================
-- RLS Policies for notifications
-- ============================================

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow system to insert notifications for any user
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
