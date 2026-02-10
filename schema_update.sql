-- Run this in your Supabase SQL Editor to update the bookings table

-- Add rejection_reason column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'rejection_reason') THEN
        ALTER TABLE public.bookings ADD COLUMN rejection_reason text;
    END IF;
END $$;

-- Add cancellation_reason column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE public.bookings ADD COLUMN cancellation_reason text;
    END IF;
END $$;
