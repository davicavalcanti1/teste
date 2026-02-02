-- Add approved column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

-- Update existing users to be approved (so we don't lock out current users)
UPDATE public.profiles SET approved = true WHERE approved IS FALSE;

-- Force default to false for new users
ALTER TABLE public.profiles 
ALTER COLUMN approved SET DEFAULT false;
