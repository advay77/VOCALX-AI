"use client";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardTopNav from "@/components/Dashboard-topNav";
import { SidebarProvider } from "@/components/ui/SideBar";
import React from "react";

function DashboardProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="flex-1">

        <DashboardTopNav />
        {children}

      </div>
    </SidebarProvider>
  );
}

export default DashboardProvider;
