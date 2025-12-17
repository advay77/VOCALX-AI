"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeProvider";
import { LuCheck, LuSend } from "react-icons/lu";
import { LuCopy } from "react-icons/lu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";
interface InterviewTableData {
  id: number;
  interview_id: string;
  jobTitle: string;
  jobDescription: string;
  interviewDuration: string;
  interviewType: string[];
  acceptResume: boolean;
}

const InterviewLink = () => {
  const { darkTheme } = useTheme();
  const [interviewData, setInterviewData] = useState<InterviewTableData | null>(
    null
  );
  const link = interviewData
    ? `${process.env.NEXT_PUBLIC_HOST_URL}/interview/${interviewData.interview_id}`
    : "";
  const encodedLink = encodeURIComponent(link);

  const handleShare = (type: "whatsapp" | "email" | "linkedin") => {
    if (!link) return;
    const shareMap = {
      whatsapp: `https://wa.me/?text=${encodedLink}`,
      email: `mailto:?subject=Interview%20Link&body=${encodedLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
    } as const;
    const url = shareMap[type];
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const fetchLatestInterview = async () => {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching interview:", error);
      toast("Error fetching interview");
    } else {
      setInterviewData(data);
    }
  };

  useEffect(() => {
    fetchLatestInterview();
  }, []);
  // console.log("interviewData", interviewData);

  return (
    <div className={`max-w-[800px] mx-auto mt-5 p-5 flex flex-col items-center justify-center rounded-xl ${darkTheme ? "bg-slate-800" : "bg-white"}`}>
      <div className="flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full animate-pulse duration-700 transition-colors">
        <LuCheck className="text-7xl text-white" />
      </div>
      <h2 className={`font-semibold text-xl font-inter mt-2 text-center ${darkTheme ? "text-white" : "text-black"}`}>
        Your AI interview link is ready
      </h2>
      <p className={`text-center mt-3 mb-6 font-inter tracking-tight text-lg ${darkTheme ? "text-slate-400" : "text-gray-500"}`}>
        Share this link below with your candidates to start the interview and
        collect resumes accordingly.
      </p>

      <div className="w-full px-10">
        <div className={`flex items-center justify-between font-inter ${darkTheme ? "text-slate-200" : ""}`}>
          <p>Interview Link</p>
          <p className={`px-3 py-1 rounded-full font-inter text-sm border ${darkTheme ? "bg-blue-900/30 text-blue-300 border-blue-600" : "bg-blue-100 text-blue-700 border-blue-600"}`}>
            Valid for 30 Days
          </p>
        </div>
        <div className="flex items-center justify-between gap-20 mt-5">
          <Input
            value={link || "Loading..."}
            readOnly
            className={`cursor-pointer ${darkTheme ? "bg-slate-700 text-white border-slate-600" : "bg-slate-100 text-black"}`}
          />
          <Button
            onClick={async () => {
              if (link) {
                await navigator.clipboard.writeText(link);
                toast("Link copied");
              }
            }}
            className={`text-white cursor-pointer ${darkTheme ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            <LuCopy className="mr-2" /> Copy Link
          </Button>
        </div>
      </div>
      <Separator className={`my-5 ${darkTheme ? "bg-slate-700" : ""}`} />
      <div className="flex items-center justify-baseline w-full gap-6">
        <p className={`font-inter ${darkTheme ? "text-slate-400" : "text-gray-500"}`}>
          Duration: {interviewData?.interviewDuration} min
        </p>
        <p className={`font-inter capitalize ${darkTheme ? "text-slate-400" : "text-gray-500"}`}>
          {interviewData?.jobTitle}
        </p>
      </div>

      <div className={`w-full mt-10 p-4 rounded-lg ${darkTheme ? "bg-slate-700" : "bg-gray-50"}`}>
        <h2 className={`mt-2 text-xl font-medium font-inter text-center ${darkTheme ? "text-white" : "text-black"}`}>
          Share Through
        </h2>
        <div className="grid grid-cols-3 gap-5 max-w-[600px] mx-auto mt-6">
          <Button
            variant={"outline"}
            className={`mt-2 ${darkTheme ? "border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white" : ""}`}
            onClick={() => handleShare("whatsapp")}
            disabled={!link}
          >
            <LuSend className="mr-2" />
            Whatsapp
          </Button>
          <Button
            variant={"outline"}
            className={`mt-2 ${darkTheme ? "border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white" : ""}`}
            onClick={() => handleShare("email")}
            disabled={!link}
          >
            <LuSend className="mr-2" />
            Email
          </Button>
          <Button
            variant={"outline"}
            className={`mt-2 ${darkTheme ? "border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white" : ""}`}
            onClick={() => handleShare("linkedin")}
            disabled={!link}
          >
            <LuSend className="mr-2" />
            Linkedin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewLink;
