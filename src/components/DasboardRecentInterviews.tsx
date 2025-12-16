/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useUserData } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useMemo, useState } from "react";
import { LuLoader, LuVideo } from "react-icons/lu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
const TYPE_OPTIONS = [
  "All",
  "Technical",
  "Behavioral",
  "Experience",
  "Problem Solving",
  "Leadership",
];
const DURATION_OPTIONS = [10, 15, 30, 45];
const DasboardRecentInterviews = () => {
  const [interviewList, setInterviewList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { users } = useUserData();
  const [view, setView] = useState("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

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

      if (error) throw error;
      setInterviewList(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedDuration(null);
  };

  const filteredInterviews = useMemo(() => {
    const selectedTypesLc = selectedTypes.map((t) => t.toLowerCase());

    const extractTypeTokens = (it: any): string[] => {
      const explicit = it.interviewType ?? it.jobType ?? it.job_title ?? it.type ?? it.category ?? null;
      const tokens: string[] = [];
      if (Array.isArray(explicit)) {
        explicit.forEach((v) => tokens.push(String(v).toLowerCase().trim()));
      } else if (typeof explicit === "string") {
        explicit
          .split(/[,/|]/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
          .forEach((v) => tokens.push(v));
      } else if (explicit != null) {
        tokens.push(String(explicit).toLowerCase().trim());
      }
      const titleLc = String(it.jobTitle || "").toLowerCase();
      const descriptionLc = String(it.jobDescription || "").toLowerCase();
      // Heuristic: include common keywords from title/description
      ["technical", "behavioral", "experience", "problem solving", "leadership"].forEach((kw) => {
        if (titleLc.includes(kw) || descriptionLc.includes(kw)) tokens.push(kw);
      });
      return Array.from(new Set(tokens));
    };

    return (interviewList || []).filter((item: any) => {
      const itemTokens = extractTypeTokens(item);
      const durationVal = Number(item.interviewDuration);
      const matchesDuration = selectedDuration === null || durationVal === selectedDuration;
      // Type matching supports two modes:
      // 1) AND mode: when specific types are selected (without "All"), item must include ALL selected types.
      // 2) ALL mode: when "All" is selected, include everything EXCEPT items that match any other selected types (treated as exclusions).
      let matchesType = true;
      const hasAll = selectedTypesLc.includes("all");
      const otherTypes = selectedTypesLc.filter((t) => t !== "all");
      if (selectedTypesLc.length === 0) {
        matchesType = true;
      } else if (hasAll) {
        // Exclude items containing any explicitly selected types (acting as blocklist)
        matchesType = otherTypes.length === 0 || !otherTypes.some((t) => itemTokens.includes(t));
      } else {
        // AND across selected types
        matchesType = otherTypes.every((t) => itemTokens.includes(t));
      }
      return matchesType && matchesDuration;
    });
  }, [interviewList, selectedTypes, selectedDuration]);

  const handleSend = (item: any) => {
    const url = `${window.location.origin}/interview/${item.interview_id}`;
    const subject = encodeURIComponent(`Interview link for ${item.jobTitle ?? "your role"}`);
    const body = encodeURIComponent(
      `Hi,

Here is your interview link: ${url}
Duration: ${item.interviewDuration ?? ""} mins.

Thanks.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="my-10 px-4 sm:px-6 lg:px-10">
      <div className=" flex items-center justify-between">
        <h2 className="font-semibold text-xl font-inter capitalize ml-5" style={{ fontSize: "37px", textDecoration: "underline" }}>
          Recent Interviews
        </h2>

        <div className="flex items-center gap-5 mr-10">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {(selectedTypes.length > 0 || selectedDuration !== null) && (
                  <span className="ml-1 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {selectedTypes.length + (selectedDuration !== null ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Interview Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPE_OPTIONS.map((t) => (
                      <label key={t} className="flex items-center gap-2 rounded-md border p-2">
                        <Checkbox
                          checked={selectedTypes.includes(t)}
                          onCheckedChange={() => toggleType(t)}
                        />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Interview Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={selectedDuration === d ? "default" : "outline"}
                        onClick={() =>
                          setSelectedDuration(selectedDuration === d ? null : d)
                        }
                      >
                        {d} min
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={() => setFilterOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

      {filteredInterviews && !loading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-10 justify-items-center"
        >
          {filteredInterviews?.map((item: any, index: number) => {
            const Icon = icons[index % icons.length]; // pick icon by index

            return (
              <Card
                key={item.interview_id}
                className="relative bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl shadow-[0_10px_40px_-24px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_50px_-22px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-200 p-6 w-full max-w-md flex flex-col gap-4"
              >
                <CardHeader className="flex flex-row items-start justify-start gap-3 pb-0">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-inner shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">Role</p>
                    <CardTitle className="font-semibold text-xl text-slate-900 font-sora leading-tight">
                      {item.jobTitle}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="text-sm text-slate-600 font-inter space-y-4 pt-2">
                  <p className="line-clamp-3 text-left leading-relaxed text-slate-700">
                    {item.jobDescription}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    {(() => {
                      const tokens = ((): string[] => {
                        const explicit = item.interviewType ?? item.jobType ?? item.job_title ?? item.type ?? item.category ?? null;
                        const t: string[] = [];
                        if (Array.isArray(explicit)) {
                          explicit.forEach((v) => t.push(String(v).toLowerCase().trim()));
                        } else if (typeof explicit === "string") {
                          explicit
                            .split(/[,/|]/)
                            .map((s) => s.trim().toLowerCase())
                            .filter(Boolean)
                            .forEach((v) => t.push(v));
                        } else if (explicit != null) {
                          t.push(String(explicit).toLowerCase().trim());
                        }
                        const titleLc = String(item.jobTitle || "").toLowerCase();
                        const descriptionLc = String(item.jobDescription || "").toLowerCase();
                        ["technical", "behavioral", "experience", "problem solving", "leadership"].forEach((kw) => {
                          if (titleLc.includes(kw) || descriptionLc.includes(kw)) t.push(kw);
                        });
                        return Array.from(new Set(t)).slice(0, 5);
                      })();
                      return tokens.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 font-medium">
                          {tag}
                        </span>
                      ));
                    })()}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium">
                      ⏱
                      <span className="text-slate-800">{item.interviewDuration} mins</span>
                    </span>
                  </div>
                </CardContent>

                <div className="h-px bg-slate-100" />

                <CardFooter className="flex justify-between gap-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/interview/${item.interview_id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard");
                    }}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    Copy Link <Copy className="ml-2 w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow"
                    onClick={() => handleSend(item)}
                  >
                    Send <Send className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DasboardRecentInterviews;
