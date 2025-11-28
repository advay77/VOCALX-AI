"use client";
import React, { useEffect, useState } from "react";
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
  const [interviewData, setInterviewData] = useState<InterviewTableData | null>(
    null
  );
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
    <div className="max-w-[800px] mx-auto mt-5 bg-white p-5 flex flex-col items-center justify-center rounded-xl">
      <div className="flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full animate-pulse duration-700 transition-colors">
        <LuCheck className="text-7xl text-white" />
      </div>
      <h2 className="font-semibold text-xl font-inter mt-2 text-center">
        Your AI interview link is ready
      </h2>
      <p className="text-center mt-3 mb-6  text-gray-500 font-inter tracking-tight text-lg">
        Share this link below with your candidates to start the interview and
        collect resumes accordingly.
      </p>

      <div className="w-full px-10">
        <div className="flex items-center justify-between font-inter">
          <p>Interview Link</p>
          <p className="bg-blue-100 px-3 py-1 rounded-full font-inter text-sm border border-blue-600">
            Valid for 30 Days
          </p>
        </div>
        <div className="flex items-center justify-between gap-20 mt-5">
          <Input
            // value={
            //   interviewData
            //     ? `${process.env.NEXT_PUBLIC_HOST_URL}/${interviewData.interview_id}`
            //     : "Loading..."
            // }
            value={
              interviewData
                ? `${process.env.NEXT_PUBLIC_HOST_URL}/interview/${interviewData.interview_id}`
                : "Loading..."
            }
            readOnly
            className="bg-slate-100 text-black cursor-pointer"
          />
          <Button
            onClick={async () => {
              if (interviewData) {
                await navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_HOST_URL}/interview/${interviewData.interview_id}`
                );
                toast("Link copied");
              }
            }}
            className="bg-blue-500 text-white cursor-pointer"
          >
            <LuCopy className="mr-2" /> Copy Link
          </Button>
        </div>
      </div>
      <Separator className="my-5" />
      <div className="flex items-center justify-baseline w-full gap-6">
        <p className="text-gray-500 font-inter">
          Duration: {interviewData?.interviewDuration} min
        </p>
        <p className="text-gray-500 font-inter capitalize">
          {interviewData?.jobTitle}
        </p>
      </div>

      <div className="w-full bg-gray-50 mt-10 p-4 rounded-lg">
        <h2 className="mt-2 text-xl font-medium font-inter text-center">
          Share Through
        </h2>
        <div className="grid grid-cols-3 gap-5 max-w-[600px] mx-auto mt-6">
          <Button variant={"outline"} className=" mt-2">
            <LuSend className="mr-2" />
            Watsapp
          </Button>
          <Button variant={"outline"} className=" mt-2">
            <LuSend className="mr-2" />
            Email
          </Button>
          <Button variant={"outline"} className=" mt-2">
            <LuSend className="mr-2" />
            Linkedin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewLink;
