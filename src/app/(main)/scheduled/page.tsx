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
  // we we have connect 2 tables interviews , interview-details using FK;
  const GetInterviewList = async () => {
    setLoading(true);
    try {
      const result = await supabase
        .from("interviews")
        .select(
          "jobTitle, jobDescription, interview_id, interview-details(userEmail)"
        )
        .eq("userEmail", users?.[0].email)
        .order("created_at", { ascending: false });
      console.log("interview data raw", result.data);
      setInterviewList(result.data);
    } catch (err) {
      console.log(err);
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
      className={`w-full h-full p-6 ${!darkTheme
          ? "bg-gradient-to-br from-blue-50 to-gray-100"
          : "bg-gray-200"
        } relative`}
    >
      <div className="">
        <div
          className={`${darkTheme ? "bg-slate-800 text-white" : "bg-white text-black"
            } rounded-md flex items-center justify-between relative h-auto max-w-[620px] mx-auto shadow`}
        >
          <div className=" flex flex-col justify-evenly h-full py-3 px-4">
            <h1 className="font-semibold text-2xl tracking-tight capitalize font-sora mb-3">
              Welcome {users?.[0].name}
            </h1>
            <p className="font-inter text-base font-medium max-w-[400px]">
              Welcome to your Scheduled interview pannel.check all the deatil of
              candidates and their given interviews.
            </p>
            <Button className="py-1 text-sm tracking-tight font-inter w-fit mt-5 bg-blue-500 text-white">
              View{" "}
            </Button>
          </div>
          <Image
            src="/partnership.png"
            width={180}
            height={180}
            alt="welcome"
            className="object-cover"
          />
        </div>
        <div className=" flex items-center justify-between mt-5">
          <h2 className="font-semibold text-2xl font-inter capitalize ml-5">
            Scheduled Interviews
          </h2>
          <div className="flex items-center gap-5 mr-10">
            <div className="space-x-2 bg-white p-2 rounded-md flex">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setView("grid")}
                className="rounded-md"
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>

              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setView("list")}
                className="rounded-md"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
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

        {interviewList && (
          <div
            className={`grid ${view === "grid" ? "grid-cols-3" : "grid-cols-1"
              } gap-4 mt-10`}
          >
            {interviewList?.map((item: any, index: number) => {
              const Icon = icons[index % icons.length]; // pick icon by index

              return (
                <Card
                  key={item.interview_id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition px-3 py-4"
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="p-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <CardTitle className="font-medium text-lg text-black font-sora">
                      {item.jobTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm text-muted-foreground text-center font-inter space-y-2">
                    <p className="line-clamp-2">{item.jobDescription}</p>

                    <div className="flex items-center gap-4 justify-end my-1">
                      <div className="rounded-full bg-green-500 w-3 h-3 "></div>
                      <p>Candidates {item["interview-details"].length}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-center gap-6">
                    <Link href={`/scheduled/${item.interview_id}/details`}>
                      <Button
                        className="font-inter text-sm cursor-pointer"
                        variant="outline"
                      >
                        View Details <LuActivity />
                      </Button>{" "}
                    </Link>
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
    </div>
  );
};

export default ScheduledInterview;
