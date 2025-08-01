-- Ensure the profiles table exists with proper structure
DO $$ 
BEGIN
    -- Check if profiles table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            role public.app_role DEFAULT 'parent'::public.app_role,
            full_name TEXT,
            phone TEXT,
            country TEXT,
            country_code TEXT,
            specialization TEXT,
            avatar_url TEXT,
            parent_features_enabled BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create or replace RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure storage policies exist for baby-images bucket (used for avatar uploads)
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('baby-images', 'baby-images', false)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Create storage policies for profile images
CREATE POLICY "Users can view their own avatar" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'baby-images' AND (storage.foldername(name))[1] = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'baby-images' AND (storage.foldername(name))[1] = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'baby-images' AND (storage.foldername(name))[1] = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[2]);