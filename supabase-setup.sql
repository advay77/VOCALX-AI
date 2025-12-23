-- =============================================
-- Users table (stores interviewer accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    picture TEXT,
    organization TEXT DEFAULT 'no organization',
    credits INTEGER DEFAULT 4,
    remainingcredits INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add credits columns if they don't exist (for existing tables)
DO $$
BEGIN
    -- Add credits column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'credits'
    ) THEN
        ALTER TABLE public.users ADD COLUMN credits INTEGER DEFAULT 4;
    END IF;
    
    -- Add remainingcredits column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'remainingcredits'
    ) THEN
        ALTER TABLE public.users ADD COLUMN remainingcredits INTEGER DEFAULT 4;
    END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Policy: Users can update their own data
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');

-- Ensure admin user has unlimited credits (set to a very high number)
-- This runs after the columns exist
DO $$
BEGIN
    -- Check if admin user exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'syedmohammadaquib12@gmail.com') THEN
        -- Update existing admin user to have unlimited credits
        UPDATE public.users 
        SET credits = 999999, remainingcredits = 999999
        WHERE email = 'syedmohammadaquib12@gmail.com';
    END IF;
END $$;

-- =============================================
-- Candidates table (stores candidate/interviewee accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    picture TEXT,
    current_occupation TEXT DEFAULT '',
    referal_link TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);

-- Enable Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Candidates can view their own data
DROP POLICY IF EXISTS "Candidates can view their own data" ON public.candidates;
CREATE POLICY "Candidates can view their own data"
ON public.candidates
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Policy: Candidates can update their own data
DROP POLICY IF EXISTS "Candidates can update their own data" ON public.candidates;
CREATE POLICY "Candidates can update their own data"
ON public.candidates
FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');

-- =============================================
-- Interviews table
-- =============================================
CREATE TABLE IF NOT EXISTS public.interviews (
    id BIGSERIAL PRIMARY KEY,
    interview_id TEXT UNIQUE NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT,
    "interviewDuration" TEXT,
    "interviewType" TEXT[],
    "acceptResume" BOOLEAN DEFAULT false,
    "questionList" JSONB,
    "userEmail" TEXT NOT NULL,
    "created_by" UUID,
    organization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add created_by column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.interviews ADD COLUMN "created_by" UUID;
    END IF;
END $$;

-- Create index on interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_interview_id ON public.interviews(interview_id);

-- Create index on userEmail for faster user queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_email ON public.interviews("userEmail");

-- Enable Row Level Security
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own interviews
DROP POLICY IF EXISTS "Users can view their own interviews" ON public.interviews;
CREATE POLICY "Users can view their own interviews"
ON public.interviews
FOR SELECT
TO authenticated
USING ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to insert their own interviews
DROP POLICY IF EXISTS "Users can create their own interviews" ON public.interviews;
CREATE POLICY "Users can create their own interviews"
ON public.interviews
FOR INSERT
TO authenticated
WITH CHECK ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to update their own interviews
DROP POLICY IF EXISTS "Users can update their own interviews" ON public.interviews;
CREATE POLICY "Users can update their own interviews"
ON public.interviews
FOR UPDATE
TO authenticated
USING ("userEmail" = auth.jwt()->>'email')
WITH CHECK ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to delete their own interviews
DROP POLICY IF EXISTS "Users can delete their own interviews" ON public.interviews;
CREATE POLICY "Users can delete their own interviews"
ON public.interviews
FOR DELETE
TO authenticated
USING ("userEmail" = auth.jwt()->>'email');

-- Optional: Grant admin full access (replace with your admin email)
DROP POLICY IF EXISTS "Admin has full access" ON public.interviews;
CREATE POLICY "Admin has full access"
ON public.interviews
FOR ALL
TO authenticated
USING ("userEmail" = 'syedmohammadaquib12@gmail.com');

-- =============================================
-- Tickets table + RLS for user-owned tickets
-- =============================================

-- Drop existing policies first (to allow column type change)
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;

CREATE TABLE IF NOT EXISTS public.tickets (
        id BIGSERIAL PRIMARY KEY,
        "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','open','closed','resolved')),
        created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If tickets already exists with integer userId, migrate to uuid and fix FK
DO $$
BEGIN
    -- Drop constraint if exists
    ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_userId_fkey;
    
    -- Only alter column type if it's not already UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'userId' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE public.tickets ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;
    END IF;
    
    -- Add constraint back
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tickets_userId_fkey'
    ) THEN
        ALTER TABLE public.tickets
            ADD CONSTRAINT tickets_userId_fkey 
            FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_userId ON public.tickets("userId");

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Recreate policies after column type change
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = public.tickets."userId"
            AND u.email = auth.jwt()->>'email'
    )
);

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
CREATE POLICY "Users can create their own tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = public.tickets."userId"
            AND u.email = auth.jwt()->>'email'
    )
);

DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
CREATE POLICY "Users can update their own tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = public.tickets."userId"
            AND u.email = auth.jwt()->>'email'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = public.tickets."userId"
            AND u.email = auth.jwt()->>'email'
    )
);

-- =============================================
-- Interview Details table (stores candidate runs)
-- =============================================

CREATE TABLE IF NOT EXISTS public."interview-details" (
    id BIGSERIAL PRIMARY KEY,
    interview_id TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    organization TEXT DEFAULT ''::TEXT,
    "acceptResume" BOOLEAN DEFAULT false,
    "resumeURL" TEXT,
    recomended TEXT DEFAULT 'No',
    feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional FK to interviews (keeps referential integrity)
-- Ensure the FK exists (Postgres doesn't support IF NOT EXISTS here reliably)
ALTER TABLE public."interview-details"
    DROP CONSTRAINT IF EXISTS fk_interview_details_interview;
ALTER TABLE public."interview-details"
    ADD CONSTRAINT fk_interview_details_interview
    FOREIGN KEY (interview_id)
    REFERENCES public.interviews(interview_id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_interview_details_interview_id
    ON public."interview-details"(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_details_user_email
    ON public."interview-details"("userEmail");

-- Enable RLS and keep open read/write (adjust if you want stricter rules)
ALTER TABLE public."interview-details" ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently (Postgres doesn't support IF NOT EXISTS on policies)
DROP POLICY IF EXISTS "interview-details allow insert" ON public."interview-details";
DROP POLICY IF EXISTS "interview-details allow select" ON public."interview-details";

CREATE POLICY "interview-details allow insert"
ON public."interview-details"
FOR INSERT
TO public
WITH CHECK (TRUE);

CREATE POLICY "interview-details allow select"
ON public."interview-details"
FOR SELECT
TO public
USING (TRUE);

