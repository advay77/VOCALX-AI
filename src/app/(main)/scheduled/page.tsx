/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useUserData } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/context/ThemeProvider";
import { Copy, LucideLoader, LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
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
} from "lucide-react";
import { LuActivity, LuLoader, LuVideo } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";

const icons = [Briefcase, Clock, FileText, UserCheck, Calendar];

const ScheduledInterview = () => {
  const { users } = useUserData();
  const { darkTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [interviewList, setInterviewList] = useState<any>([]);
  const [view, setView] = useState("grid");

  useEffect(() => {
    users && GetInterviewList();
  }, [users]);

  // Subscribe to real-time updates for interview-details
  useEffect(() => {
    if (!users?.[0]?.email) return;

    const channel = supabase
      .channel("interview-details-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interview-details",
        },
        () => {
          console.log("New interview detail detected, refreshing list...");
          GetInterviewList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [users?.[0]?.email]);

  // we we have connect 2 tables interviews , interview-details using FK;
  const GetInterviewList = async () => {
    setLoading(true);
    try {
      const result = await supabase
        .from("interviews")
        .select(
          "jobTitle, jobDescription, interview_id, created_at, interview-details(userEmail, userName, feedback, resumeURL, created_at)"
        )
        .eq("userEmail", users?.[0].email)
        .order("created_at", { ascending: false });
      console.log("interview data with candidates", result.data);
      setInterviewList(result.data || []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="flex items-center gap-2">
          <LucideLoader className="animate-spin" size={32} />
          <h2 className="text-2xl">Loading Contents...</h2>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`w-full min-h-screen p-6 ${!darkTheme
        ? "bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20"
        : "bg-slate-900"
        } relative`}
    >
      <div>
        {/* Welcome card */}
        <div
          className={`${darkTheme ? "bg-slate-800 text-white" : "bg-white text-black"}
            rounded-2xl flex items-center justify-between relative max-w-[900px] mx-auto shadow-xl hover:shadow-2xl transition-all border border-blue-100/30 overflow-hidden`}
        >
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

          <div className="relative z-10 flex flex-col justify-evenly h-full py-6 px-6">
            <h1 className="font-bold text-3xl tracking-tight capitalize font-sora mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome {users?.[0].name}
            </h1>
            <p className="font-inter text-sm md:text-base font-medium max-w-[520px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Track and manage all your scheduled interviews. Review candidates and open interview details in one place.
            </p>
            <Button className="py-2 px-4 text-sm tracking-tight font-inter font-semibold w-fit mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
              View
            </Button>
          </div>
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl rounded-full" />
            <Image
              src="/partnership.png"
              width={220}
              height={220}
              alt="welcome"
              className="object-cover relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mt-8 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            <h2 className={`font-bold text-2xl md:text-3xl font-sora tracking-tight ${darkTheme
                ? "text-white"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              }`}>
              Interview Results & Candidates
            </h2>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          {interviewList?.length == 0 && (
            <div className=" flex flex-col justify-center items-center mt-20">
              <LuVideo className="text-3xl text-blue-600" />
              <p className="text-2xl font-medium tracking-tight font-inter mt-2 text-gray-500">
                No Interviews to display
              </p>
            </div>
          )}
        </div>

        {/* Interview sections with candidates */}
        {interviewList && interviewList.length > 0 && (
          <div className="space-y-10 mt-10 max-w-[1400px] mx-auto">
            {interviewList?.map((interview: any, index: number) => {
              const Icon = icons[index % icons.length];
              const candidates = interview["interview-details"] || [];

              return (
                <div
                  key={interview.interview_id}
                  className={`${darkTheme ? "bg-slate-800/50 border border-slate-700" : "bg-white"} rounded-2xl p-6 shadow-lg relative overflow-hidden`}
                >
                  {/* Decorative top line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                  {/* Interview header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <Icon className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl font-sora mb-1">{interview.jobTitle}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">{interview.jobDescription}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="inline-flex w-2 h-2 rounded-full bg-green-500" />
                            Active
                          </span>
                          <span className="text-xs text-slate-500">
                            {candidates.length} {candidates.length === 1 ? "Candidate" : "Candidates"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/scheduled/${interview.interview_id}/details`}>
                      <Button variant="outline" className="font-inter text-sm">
                        Full Details <LuActivity className="ml-2" />
                      </Button>
                    </Link>
                  </div>

                  {/* Candidates list */}
                  {candidates.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">No candidates have completed this interview yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {candidates.map((candidate: any, idx: number) => {
                        // Calculate average rating
                        const ratings = candidate.feedback?.data?.feedback?.rating;
                        let avgScore: number | null = null;
                        if (ratings) {
                          const values = Object.values(ratings);
                          const sum = values.reduce((acc: number, v: any) => acc + (v ?? 0), 0);
                          avgScore = values.length > 0 ? sum / values.length : null;
                        }

                        const getColor = (score: number) => {
                          if (score < 5) return "text-red-500";
                          if (score < 7) return "text-orange-500";
                          return "text-green-500";
                        };

                        const recommendation = candidate.feedback?.data?.feedback?.recommendation;

                        return (
                          <Card
                            key={idx}
                            className={`${darkTheme ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"} p-4 relative group hover:shadow-md transition-all`}
                          >
                            <div className="flex items-start gap-3">
                              <Image
                                src="/profile.png"
                                alt="profile"
                                width={48}
                                height={48}
                                className="rounded-full flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold capitalize font-inter text-sm truncate">
                                  {candidate.userName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {candidate.userEmail}
                                </p>
                                {avgScore !== null && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`font-bold text-sm ${getColor(avgScore)}`}>
                                      {avgScore.toFixed(1)}/10
                                    </span>
                                    {recommendation && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${recommendation === "Yes"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        }`}>
                                        {recommendation === "Yes" ? "Approved" : "Not Recommended"}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Link href={`/scheduled/${interview.interview_id}/details`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  <LuActivity className="mr-1 h-3 w-3" /> Report
                                </Button>
                              </Link>
                              {candidate.resumeURL && (
                                <Link href={`/scheduled/${interview.interview_id}/details`} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full text-xs">
                                    <LuDock className="mr-1 h-3 w-3" /> Resume
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default ScheduledInterview;
