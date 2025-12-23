/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { LuLoader, LuArrowRight } from "react-icons/lu";
import { useUserData } from "@/context/UserDetailContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { darkTheme } = useTheme();
  const { users, loading, isNewUser, constCreateNewUser } = useUserData();

  const [orgInput, setOrgInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!users || users.length === 0 || submitting) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("users")
      .update({ organization: orgInput })
      .eq("id", users[0].id);

    if (error) {
      console.error("❌ Error updating organization:", error.message);
      setSubmitting(false);
    } else {
      await constCreateNewUser();
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (users && !isNewUser) {
      router.push("/dashboard");
    }
  }, [loading, isNewUser, users]);

  if (loading || !users) {
    return (
      <div className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.12),transparent_30%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-sora font-black tracking-tight mb-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-transparent bg-clip-text">
              INTERVIEWX
            </h1>
            <div className="h-1.5 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full" />
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur rounded-full shadow-lg border border-blue-100">
            <LuLoader className="animate-spin text-xl text-blue-600" />
            <p className="text-lg font-semibold text-gray-800 font-inter">
              Redirecting To Dashboard...
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  return isNewUser ? (
    <div className={clsx(
      "w-full h-screen flex flex-col items-center justify-center relative overflow-hidden",
      darkTheme
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-blue-50 via-slate-50 to-slate-50"
    )}>
      {/* Decorative background gradient */}
      <div className={clsx(
        "absolute inset-0 -z-10",
        darkTheme
          ? "bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.1),transparent_40%)]"
          : "bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.12),transparent_40%)]"
      )} />

      {/* Main Card */}
      <div className={clsx(
        "p-8 rounded-3xl shadow-2xl border max-w-md w-full space-y-6 relative overflow-hidden",
        darkTheme
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700"
          : "bg-gradient-to-br from-white via-blue-50 to-white border-blue-200/50"
      )}>
        {/* Decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

        {/* Decorative accent elements */}
        <div className={clsx(
          "absolute top-1/2 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none",
          darkTheme ? "bg-blue-500" : "bg-blue-400"
        )}></div>

        <div className={clsx(
          "absolute -bottom-10 -left-20 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none",
          darkTheme ? "bg-indigo-500" : "bg-indigo-400"
        )}></div>

        {/* Brand Header */}
        <div className="text-center pt-2">
          <h1 className={clsx(
            "font-extrabold text-3xl md:text-4xl font-sora tracking-tight",
            darkTheme ? "text-white" : "text-gray-900"
          )}>
            INTERVIEWX
          </h1>
        </div>

        {/* Welcome Message */}
        <div className="text-center space-y-3">
          <h2 className={clsx(
            "text-2xl font-bold font-sora tracking-tight",
            darkTheme ? "text-white" : "text-gray-900"
          )}>
            Welcome, {users?.[0].name?.split(" ")?.[0]}
          </h2>

          <p className={clsx(
            "text-base leading-relaxed font-inter",
            darkTheme ? "text-slate-300" : "text-gray-600"
          )}>
            Before proceeding, please enter your <span className="font-semibold">organization name</span>.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Organization Input */}
          <div className="space-y-2">
            <label className={clsx(
              "block text-sm font-semibold font-inter",
              darkTheme ? "text-slate-200" : "text-gray-700"
            )}>
              Organization
            </label>
            <Input
              type="text"
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
              placeholder="e.g. Vrsa Analytics"
              disabled={submitting}
              className={clsx(
                "h-12 px-5 rounded-xl border-2 font-inter text-base transition-all duration-300 focus:outline-none",
                darkTheme
                  ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:shadow-lg focus:shadow-blue-500/20"
                  : "bg-white border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-300/30"
              )}
            />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || orgInput.trim() === ""}
            className={clsx(
              "w-full h-12 rounded-xl font-inter font-bold text-base tracking-tight flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
              darkTheme
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {submitting ? (
              <>
                <LuLoader className="w-5 h-5 animate-spin" />
                <span>Continuing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  ) : null;
}
