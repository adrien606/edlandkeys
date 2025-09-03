-- Add secondary phone number field to clients table
ALTER TABLE public.clients 
ADD COLUMN telephone_secondaire text;