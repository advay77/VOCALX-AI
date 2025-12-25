import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { interviewID } = await req.json();

        if (!interviewID) {
            return NextResponse.json(
                { error: "Interview ID is required" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

        if (!supabaseUrl || !serviceKey) {
            console.error('[get-interview] Missing supabase URL or service key');
            return NextResponse.json(
                { error: "Supabase service key or URL not configured" },
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey);

        const { data: interviews, error } = await supabaseAdmin
            .from("interviews")
            .select("jobTitle, jobDescription, interviewDuration, acceptResume, organization, questionList, interview_id")
            .eq("interview_id", interviewID)
            .maybeSingle();

        if (error) {
            console.error('[get-interview] supabase query error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!interviews) {
            return NextResponse.json(
                { error: "Interview not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ interview: interviews });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[get-interview] exception:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
