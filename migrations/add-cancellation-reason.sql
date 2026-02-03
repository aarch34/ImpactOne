-- Add cancellation_reason column to bookings table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
