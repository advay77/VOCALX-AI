/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { LuLoader } from "react-icons/lu";
import { useUserData } from "@/context/UserDetailContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AuthCallbackPage() {
  const router = useRouter();
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
      <div className="bg-gray-100 w-full h-screen flex flex-col justify-center items-center">
        <h2 className="text-3xl font-sora tracking-tight font-semibold mb-3">
          INTERVIEWX AI
        </h2>
        <p className="text-2xl font-medium font-sora flex items-center gap-4">
          <LuLoader className="animate-spin text-xl text-black duration-500" />
          Redirecting To Dashboard...
        </p>
      </div>
    );
  }

  return isNewUser ? (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "#ffffff",
          backgroundImage: `
        radial-gradient(
          circle at top center,
          rgba(70, 130, 180, 0.5),
          transparent 70%
        )
      `,
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="p-8 rounded-2xl shadow-lg border bg-white max-w-md w-full space-y-6 relative overflow-hidden">
        {/* Gradient Accent Border */}


        <h1 className="font-extrabold text-3xl font-sora text-center tracking-tight">
          INTERVIEWX
        </h1>

        <h2 className="text-xl font-semibold font-sora text-center text-gray-800">
          Welcome, {users?.[0].name}
        </h2>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2" />
        <p className="text-base text-gray-600 font-inter text-center leading-relaxed">
          Before proceeding, please enter your{" "}
          <span className="font-semibold text-gray-900">organization name</span>
          .
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Organization
          </label>
          <Input
            type="text"
            value={orgInput}
            onChange={(e) => setOrgInput(e.target.value)}
            placeholder="e.g. Vrsa Analytics"
            className="focus:ring-2 focus:ring-black/80 focus:border-black transition rounded-lg"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || orgInput.trim() === ""}
          className="w-full py-3 rounded-xl font-semibold text-white bg-black hover:bg-gray-900 active:scale-[0.98] transition flex justify-center"
        >
          {submitting ? (
            <span className="flex items-center gap-2 font-inter">
              <LuLoader className="animate-spin w-4 h-4" />
              Saving...
            </span>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  ) : null;
}
