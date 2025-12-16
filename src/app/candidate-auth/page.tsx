"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { BsStars } from "react-icons/bs";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-hot-toast";
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LuChevronRight, LuInfo, LuLoader } from "react-icons/lu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const StudentLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignup, setIsSignup] = useState<boolean>(false);

  async function HandleAuth() {
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: "candidate" },
            emailRedirectTo: `${window.location.origin}/email-verified`,
          },
        });

        if (error) throw error;
        if (data.user && !data.session) {
          setError("Please check your email for verification link");
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {},
        });

        if (error) throw error;
        if (data.session) {
          router.push("/candidate-auth/callback");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-full h-screen relative overflow-hidden"
      )}
    >
      {/* Gradient + Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(135deg, 
          rgba(248,250,252,1) 0%, 
          rgba(219,234,254,0.7) 30%, 
          rgba(165,180,252,0.5) 60%, 
          rgba(129,140,248,0.6) 100%
        ),
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(199,210,254,0.4) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(224,231,255,0.3) 0%, transparent 60%)
      `,
        }}
      />

      {/* Content */}
      {/* animate-moving-gradient */}
      <div className="flex flex-col items-center justify-center relative z-10 ">
        <div className="text-sm px-6 text-gray-800 font-medium flex items-center justify-center gap-3 py-1 border-2 border-yellow-500 rounded-full mb-20 ">
          For Candidates{" "}
          <BsStars className="inline-flex text-yellow-400 text-xl" />
        </div>

        <h1 className="font-extrabold text-5xl md:text-6xl font-sora tracking-tight mb-3">
          INTERVIEWX
        </h1>

        <h2 className=" text-2xl md:text-4xl font-sora font-semibold tracking-tight text-center w-full md:max-w-[700px] mx-auto  leading-tight max-[600px]:px-4 max-[650px]:mt-3">
          AI-powered Recruitment Platform To Simplify Hiring
        </h2>

        <div className="max-[650px]:hidden w-[40rem] relative my-5">
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
          <div className="max-w-[20rem] h-[2rem] mx-auto">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1000}
              className="w-full h-full"
              particleColor="#0000"
            />
          </div>
        </div>

        <p className="font-inter text-lg font-light mb-3">
          {" "}
          Continue with{" "}
          <span className="font-medium font-raleway  text-blue-500  ml-4">
            {isSignup ? "Creating Account" : "Logging In"}
          </span>
        </p>

        <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto ">
          <div className="flex items-center justify-center gap-2 ">
            <Label className="font-inter">Email</Label>
            <Input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border bg-white"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Label className="font-inter">Pass</Label>
            <Input
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border bg-white"
            />
          </div>

          <Button
            className=" border rounded-md cursor-pointer bg-gradient-to-br from-slate-700 to-black text-white font-inter"
            disabled={loading}
            onClick={HandleAuth}
          >
            {loading ? (
              <>
                <LuLoader className="animate-spin" />
                {isSignup ? "Signing up..." : "Signing in..."}
              </>
            ) : (
              <>
                {isSignup ? "Sign Up" : "Sign In"}
                <LuChevronRight />
              </>
            )}
          </Button>

          <p className="font-inter text-sm font-light">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              className="font-medium text-blue-500 text-sm font-raleway cursor-pointer"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>

        {error && (
          <p className="font-sora text-sm text-gray-600 text-center mt-10">
            <LuInfo className="mr-2 inline" /> {error}
          </p>
        )}

        <p className="text-gray-600 mt-12 text-sm font-light cursor-pointer font-inter ">
          You are a Recruiter ?{" "}
          <span
            onClick={() => router.push("/auth")}
            className="text-blue-600 underline underline-offset-4 cursor-pointer"
          >
            Click Here !
          </span>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
