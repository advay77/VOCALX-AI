"use client";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LuLoader } from "react-icons/lu";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error fetching session:", error.message);
        setTimeout(() => router.replace("/auth"), 3000);
        return;
      }

      if (session && session.user) {
        console.log("✅ Session found:", session.user.email);
        setTimeout(() => router.replace("/auth/callback"), 3000);
      } else {
        console.log("❌ No session, redirecting to /web");
        setTimeout(() => router.replace("/auth"), 3000);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="z-50 flex flex-col items-center justify-center w-full h-screen ">
        <h1 className="font-extrabold md:text-2xl font-sora tracking-tight mb-3 z-50">
          INTERVIEWX AI
        </h1>
        <p className="flex items-center mt-3 gap-4 text-lg font-inter"><LuLoader className="animate-spin" /> Configuring your Session</p>
      </div>
    </div>
  );
}
