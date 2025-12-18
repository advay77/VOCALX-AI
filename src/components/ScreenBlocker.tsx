"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LuMonitor, LuLaptop, LuTriangleAlert } from "react-icons/lu";

const ScreenSizeBlocker = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth < 820);
    };

    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="sm:max-w-[480px] text-center border-2 border-blue-200 dark:border-blue-900 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Decorative gradient header bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>

        <DialogHeader className="space-y-6 pt-6 pb-4">
          {/* Icon Container */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Animated alert circle */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg">
                <LuTriangleAlert className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <DialogTitle className="text-2xl font-black font-sora tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Screen Size Too Small
            </DialogTitle>

            <DialogDescription className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-inter px-4">
              This application requires a larger screen to function properly and provide the best user experience.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Requirements section */}
        <div className="pb-6 px-6 space-y-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 space-y-4 border border-blue-200/50 dark:border-slate-600">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-inter">
              Minimum Requirements:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-blue-200 dark:border-slate-600">
                  <LuLaptop className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Laptop Computer
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recommended for optimal experience
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-blue-200 dark:border-slate-600">
                  <LuMonitor className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Desktop PC
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Minimum screen width: 820px
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-inter italic">
            Please resize your browser window or switch to a larger device
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenSizeBlocker;
