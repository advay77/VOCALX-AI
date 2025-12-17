-- Create interviews table
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
    organization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_interview_id ON public.interviews(interview_id);

-- Create index on userEmail for faster user queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_email ON public.interviews("userEmail");

-- Enable Row Level Security
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own interviews
CREATE POLICY "Users can view their own interviews"
ON public.interviews
FOR SELECT
TO authenticated
USING ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to insert their own interviews
CREATE POLICY "Users can create their own interviews"
ON public.interviews
FOR INSERT
TO authenticated
WITH CHECK ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to update their own interviews
CREATE POLICY "Users can update their own interviews"
ON public.interviews
FOR UPDATE
TO authenticated
USING ("userEmail" = auth.jwt()->>'email')
WITH CHECK ("userEmail" = auth.jwt()->>'email');

-- Policy: Allow authenticated users to delete their own interviews
CREATE POLICY "Users can delete their own interviews"
ON public.interviews
FOR DELETE
TO authenticated
USING ("userEmail" = auth.jwt()->>'email');

-- Optional: Grant admin full access (replace with your admin email)
CREATE POLICY "Admin has full access"
ON public.interviews
FOR ALL
TO authenticated
USING ("userEmail" = 'syedmohammadaquib12@gmail.com');

-- =============================================
-- Tickets table + RLS for user-owned tickets
-- =============================================

CREATE TABLE IF NOT EXISTS public.tickets (
        id BIGSERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','open','closed','resolved')),
        created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_userId ON public.tickets("userId");

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own tickets
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

-- Allow authenticated users to insert their own tickets
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

-- Allow authenticated users to update their own tickets
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

