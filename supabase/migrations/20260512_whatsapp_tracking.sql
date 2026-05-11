-- Track WhatsApp notification delivery per booking
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS whatsapp_notification_sent BOOLEAN DEFAULT FALSE;
