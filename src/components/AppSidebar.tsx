"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/SideBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LuCircleFadingPlus,
  LuLayoutGrid,
  LuCalendarDays,
  LuBoxes,
  LuWalletCards,
  LuSettings,
  LuChevronsDownUp,
} from "react-icons/lu";
import { useTheme } from "@/context/ThemeProvider";
import clsx from "clsx";
import { useUserData } from "@/context/UserDetailContext";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "./ui/progress";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LuLayoutGrid,
  },
  {
    title: "Scheduled",
    url: "/scheduled",
    icon: LuCalendarDays,
  },
  {
    title: "All Interviews",
    url: "/all-interviews",
    icon: LuBoxes,
  },
  {
    title: "Billing",
    url: "#",
    icon: LuWalletCards,
  },
  {
    title: "Setting",
    url: "#",
    icon: LuSettings,
  },
];
export function AppSidebar() {
  const { users, remainingCredits } = useUserData();
  const path = usePathname();
  const { darkTheme } = useTheme();

  const totalCredits = users?.[0].credits || 0;
  const progress = (remainingCredits / totalCredits) * 100;
  // console.log("USERS DATA IN APPSIDEBAR", users);
  return (
    <Sidebar>
      <SidebarHeader className="">
        <div className="flex items-center justify-center gap-7">
          <div
            className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg font-inter",
              darkTheme ? "bg-white text-black" : "bg-blue-600 text-white"
            )}
          >
            V
          </div>
          <div>
            <h2
              className={clsx(
                "text-xl font-bold font-sora tracking-tight text-center",
                darkTheme ? "text-white" : "text-black"
              )}
            >
              VOCALHIRE
            </h2>
            <p className="text-sm text-gray-500 capitalize font-medium truncate font-inter max-w-[180px]">
              {users?.[0].organization}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <Separator className="my-3" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={clsx(
              "text-base  font-inter font-light flex items-center justify-center",
              darkTheme ? "text-gray-400" : "text-gray-500"
            )}
          >
            New Interview
          </SidebarGroupLabel>
          <Link href="/dashboard/create-interview" className="w-full mx-auto">
            <Button
              className={clsx(
                "mt-2 font-inter flex items-center gap-4 cursor-pointer mx-auto w-full",
                darkTheme ? "bg-blue-600 text-white" : "bg-gray-900 text-white"
              )}
            >
              <LuCircleFadingPlus className="" />
              Create New Interview
            </Button>{" "}
          </Link>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel
            className={clsx(
              "text-base  font-inter font-light flex items-center justify-center",
              darkTheme ? "text-gray-400" : "text-gray-500"
            )}
          >
            Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={clsx(path === item.url && "text-primary")}
                >
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-4 mb-2"
                  >
                    <Link href={item.url}>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <item.icon className="w-full h-full" />
                      </div>

                      <span
                        className={clsx("font-inter text-base tracking-tight")}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* AD FOR PRO */}
        <div className="h-[184px] bg-gradient-to-br from-blue-500 to-indigo-200 w-full mb-5 rounded-lg pt-3 pb-1 px-2 relative overflow-hidden">
          <div className="flex justify-between items-center mb-1 px-3">
            <span className="text-white font-poppins font-medium text-base">
              {remainingCredits} left
            </span>
            <span className="text-white font-poppins font-medium text-base">
              {totalCredits}
            </span>
          </div>

          <Progress value={progress} className="h-2 rounded-full bg-gray-300">
            <div
              className="h-full rounded-full "
              style={{
                width: `${progress}%`,
                backgroundColor: "white",
              }}
            ></div>
          </Progress>

          <div className="w-full">
            <h3 className="text-white font-poppins font-medium text-base hover:text-black mt-1 cursor-pointer">
              Get more credits
            </h3>
            <h2 className="text-balance mt-5  font-inter font-medium text-black text-base max-w-[140px] leading-tight">
              {users?.[0].name} you can make {remainingCredits} more Interviews
            </h2>
            <Image
              src="/element2.png"
              alt="ad"
              width={350}
              height={350}
              className=" absolute -bottom-2 left-20"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-600 rounded-md px-2 py-1 text-white">
          <Image
            src={users?.[0].picture || "/avatar.png"}
            alt="profile"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col font-inter">
            <p className="text-base font-medium tracking-tight">
              {users?.[0].name}
            </p>
            <p className="font-light text-sm truncate max-w-[140px]">
              {users?.[0].email}
            </p>
          </div>
          <Popover>
            <PopoverTrigger className="">
              <LuChevronsDownUp className="text-xl text-white cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-44 ">
              <div></div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
