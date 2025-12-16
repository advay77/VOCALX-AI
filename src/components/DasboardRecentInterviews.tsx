/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useUserData } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useState } from "react";
import { LuLoader, LuVideo } from "react-icons/lu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";

import {
  Briefcase,
  Clock,
  FileText,
  UserCheck,
  Calendar,
  Send,
  Grid2X2,
  List,
  Filter,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

const icons = [Briefcase, Clock, FileText, UserCheck, Calendar];
const DasboardRecentInterviews = () => {
  const [interviewList, setInterviewList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { users } = useUserData();
  const [view, setView] = useState("grid");

  useEffect(() => {
    users && GetInterview();
  }, [users]);

  const GetInterview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("userEmail", users?.[0].email)
        .order("created_at", { ascending: false })
        .limit(3);

      // console.log("interview data raw", data);
      setInterviewList(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10">
      <div className=" flex items-center justify-between">
        <h2 className="font-semibold text-xl font-inter capitalize ml-5" style={{ fontSize: "37px", textDecoration: "underline" }}>
          Recent Interviews
        </h2>

        <div className="flex items-center gap-5 mr-10">
          <div className="flex items-center gap-3 bg-white p-2 rounded-md">
            <Filter />
            <p>Filters</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="w-full h-full flex items-center justify-center -mt-10">
          <div className="flex flex-col justify-center items-center mt-20">
            <LuLoader className="text-xl text-blue-600 animate-spin" />
            <p className="text-lg font-medium tracking-tight font-inter mt-2 text-gray-500">
              Loading Interviews
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-center">
        {interviewList?.length == 0 && !loading && (
          <div className=" flex flex-col justify-center items-center mt-20">
            <LuVideo className="text-3xl text-blue-600" />
            <p className="text-xl font-medium tracking-tight font-inter mt-2 text-gray-500">
              No Interviews to display
            </p>
          </div>
        )}
      </div>

      {interviewList && !loading && (
        <div
          className={`grid ${view === "grid" ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            } gap-4 mt-10`}
        >
          {interviewList?.map((item: any, index: number) => {
            const Icon = icons[index % icons.length]; // pick icon by index

            return (
              <Card
                key={item.interview_id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-4"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="p-2 rounded-md bg-gray-100">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <CardTitle className="font-semibold text-lg text-black font-sora">
                    {item.jobTitle}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground text-center font-inter space-y-2">
                  <p className="line-clamp-2">{item.jobDescription}</p>
                  <div className="flex items-center justify-start text-base mt-4 text-gray-500">
                    <span>⏱ {item.interviewDuration} mins</span>
                    {/* <span>📌 {item.interviewType}</span> */}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-center gap-6 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/interview/${item.interview_id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard");
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    Copy Link <Copy className="ml-2 w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    className=" bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => { }}
                  >
                    Send <Send className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* <div
        className={`grid ${
          view === "grid" ? "grid-cols-3" : "grid-cols-1"
        } border-dashed border-blue-600 p-4 rounded-md bg-white`}
      >
        <div className="flex w-full h-full items-center justify-center">
          hello
        </div>
      </div> */}
    </div>
  );
};

export default DasboardRecentInterviews;
