-- Cleaned Database Schema for ImpactOne Booking System
-- This schema removes unused columns and keeps only what's actively used

-- ============================================
-- TABLE: bookings
-- ============================================
CREATE TABLE public.bookings (
  -- Primary Key
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Resource Information
  resource_type text NOT NULL CHECK (resource_type = ANY (ARRAY['venue'::text, 'bus'::text, 'turf'::text])),
  resource_id text NOT NULL,
  resource_name text NOT NULL,
  sub_area text,        -- Optional sub-area (e.g., specific court in turf)
  facility text,        -- Not used in current implementation, consider removing if not needed
  
  -- Booking Date & Time
  booking_date timestamp with time zone NOT NULL,
  start_time text,      -- For custom time bookings
  end_time text,        -- For custom time bookings
  selected_slots text[], -- Array of time slots (e.g., ['09:00', '09:30', '10:00'])
  duration_type text CHECK (duration_type = ANY (ARRAY['custom'::text, 'full-day'::text])),
  
  -- Event Details
  event_title text NOT NULL,
  event_description text NOT NULL,
  attendees integer NOT NULL CHECK (attendees >= 0),
  
  -- Department & Category
  department text NOT NULL,
  department_category text,
  
  -- Requester Information
  requester_id text NOT NULL,
  requester_name text NOT NULL,
  requester_email text,
  
  -- Faculty Information
  faculty_incharge text,
  contact_email text,
  contact_number text,
  
  -- Booking Status & Review
  status text NOT NULL CHECK (status = ANY (ARRAY['Pending'::text, 'Approved'::text, 'Rejected'::text, 'Cancelled'::text])),
  reviewed_at timestamp with time zone,
  reviewed_by text,
  cancellation_reason text,  -- Reason for cancellation (if cancelled)
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Primary Key Constraint
  CONSTRAINT bookings_pkey PRIMARY KEY (id)
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE public.notifications (
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
-- INDEXES for Performance
-- ============================================

-- Index for faster booking queries by date
CREATE INDEX idx_bookings_booking_date ON public.bookings(booking_date);

-- Index for faster status queries
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Index for requester queries
CREATE INDEX idx_bookings_requester_id ON public.bookings(requester_id);
CREATE INDEX idx_bookings_requester_email ON public.bookings(requester_email);

-- Index for notifications by user
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================
-- NOTES
-- ============================================
-- 
-- Columns in Use:
-- - All resource fields (resource_type, resource_id, resource_name, sub_area)
-- - All date/time fields (booking_date, start_time, end_time, selected_slots, duration_type)
-- - All event fields (event_title, event_description, attendees)
-- - All requester fields (requester_id, requester_name, requester_email)
-- - All faculty fields (faculty_incharge, contact_email, contact_number)
-- - All status fields (status, reviewed_at, reviewed_by, cancellation_reason)
-- - All department fields (department, department_category)
--
-- Potentially Unused:
-- - facility: Not seen in current UI, verify before removing
--
-- Recommendations:
-- 1. If 'facility' is not used, remove it
-- 2. Consider adding ON DELETE CASCADE to notification foreign key (already added above)
-- 3. Add indexes for frequently queried columns (already added above)
