/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeProvider";
import { useUserData } from "@/context/UserDetailContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DashBoardOptions from "@/components/DashBoardOptions";
import DasboardRecentInterviews from "@/components/DasboardRecentInterviews";
import { SheetDemo } from "@/components/DashBoardRightSlider";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScreenSizeBlocker from "@/components/ScreenBlocker";
import { useRouter } from "next/navigation";

const Page = () => {
  const { darkTheme } = useTheme();
  const { users, loading } = useUserData();
  const router = useRouter();
  const [showRecentInterviewsModal, setShowRecentInterviewsModal] = useState(false);

  const openRecentInterviewsModal = () => {
    setShowRecentInterviewsModal(true);
  };

  return (
    <div
      className={`w-full h-full ${!darkTheme
        ? "bg-gradient-to-br from-blue-50 to-gray-100"
        : "bg-gray-200"
        } relative`}
    >
      <div className="flex-1">
        <div className="w-full py-4 px-6">
          {/* WELCOM BOX */}
          <div
            className={`${darkTheme ? "bg-slate-800 text-white" : "bg-white text-black"
              } rounded-md flex items-center justify-between relative h-auto max-w-[620px] mx-auto shadow`}
          >
            <div className=" flex flex-col justify-evenly h-full py-3 px-4">
              <h1 className="font-semibold text-2xl tracking-tight capitalize font-sora mb-3">
                Welcome {users?.[0].name}
              </h1>
              <p className="font-inter text-base font-medium max-w-[400px]">
                Welcome to your dashboard. check out the recent activity , who
                has given the interview
              </p>
              <Button className="py-1 text-sm tracking-tight font-inter w-fit mt-5 bg-blue-500 text-white">
                View{" "}
              </Button>
            </div>
            <Image
              src="/discussion.png"
              width={180}
              height={180}
              alt="welcome"
              className="object-cover"
            />
          </div>
          {/* OPTIONS */}
          <DashBoardOptions />

          {/* VIEW RECENT INTERVIEWS BUTTON */}
          <div className="flex justify-center mt-8 mb-8">
            <Button
              onClick={openRecentInterviewsModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-inter font-semibold py-2 px-6 rounded-lg"
            >
              View Recent Interviews
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL FOR RECENT INTERVIEWS */}
      <Dialog open={showRecentInterviewsModal} onOpenChange={setShowRecentInterviewsModal}>
        <DialogContent className="sm:max-w-[80vw] w-[98vw] h-[80vh] overflow-y-auto p-6">
          <DasboardRecentInterviews />
        </DialogContent>
      </Dialog>

      <SheetDemo />

      <ScreenSizeBlocker />
    </div>
  );
};

export default Page;
