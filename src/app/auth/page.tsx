"use client";
import React from "react";
import clsx from "clsx";
import { BsStars } from "react-icons/bs";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-hot-toast";
import { SparklesCore } from "@/components/ui/sparkles";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const Login = () => {
  const router = useRouter();
  const handleLogin = async (provider: "google" | "discord") => {
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback";

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

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
          linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
          radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
          radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
        `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* Content */}
      {/* animate-moving-gradient */}
      <div className="flex flex-col items-center justify-center relative z-10 ">
        <div className="text-sm px-6 text-gray-800 font-medium flex items-center justify-center gap-3 py-1 border-2 border-yellow-500 rounded-full mb-20 ">
          Try it for Free{" "}
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

        <p className="text-gray-800 max-[650px]:mt-14 mt-6 mb-5 text-xl font-inter font-medium">
          Continue To Get Started
        </p>

        <div className="flex max-[650px]:flex-col items-center justify-center gap-5">
          <Button
            onClick={() => handleLogin("google")}
            variant="outline"
            className="py-5 shadow-md cursor-pointer"
          >
            <span className="flex items-center justify-between gap-5 font-inter text-black tracking-tight">
              <Image src="/google.png" alt="Google" width={25} height={25} />
              Continue with Google
            </span>
          </Button>

          <Button
            onClick={() => handleLogin("discord")}
            variant="outline"
            className="py-5 shadow-md cursor-pointer"
          >
            <span className="flex items-center justify-between gap-5 font-inter text-black tracking-tight">
              <Image src="/discord.png" alt="Google" width={25} height={25} />
              Continue with Discord
            </span>
          </Button>
        </div>

        <p className="text-gray-600 mt-12 text-sm font-light cursor-pointer font-inter ">
          You are a Candidate ? <span onClick={() => router.push("/candidate-auth")} className="text-blue-600 underline underline-offset-4 cursor-pointer">Click Here !</span>
        </p>

      </div>
    </div>
  );
};

export default Login;
