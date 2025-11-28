import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Debug logs (do not print secrets)
        console.log('[create-user] request body keys:', Object.keys(body));

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

        // Log presence of env vars (mask actual values)
        console.log('[create-user] NEXT_PUBLIC_SUPABASE_URL present:', !!supabaseUrl);
        console.log('[create-user] SUPABASE_SERVICE_ROLE present:', !!serviceKey);

        if (!supabaseUrl || !serviceKey) {
            console.error('[create-user] Missing supabase URL or service key');
            return NextResponse.json(
                { error: "Supabase service key or URL not configured" },
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey);

        const { data, error } = await supabaseAdmin
            .from("users")
            .insert([body])
            .select();

        if (error) {
            console.error('[create-user] supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
