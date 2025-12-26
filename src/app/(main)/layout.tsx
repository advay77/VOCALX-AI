"use client";
import DashboardProvider from "./provider";
import { Toaster } from "@/components/ui/sonner"
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardProvider>{children}</DashboardProvider>
      <Toaster />
    </div>
  );
}

export default DashboardLayout;
