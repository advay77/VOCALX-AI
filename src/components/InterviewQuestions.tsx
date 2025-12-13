/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { LuLoader, LuX } from "react-icons/lu";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "./ui/separator";
import { LuArrowRight, LuBrain } from "react-icons/lu";
import { supabase } from "@/services/supabaseClient";
import { useUserData } from "@/context/UserDetailContext";
import { v4 as uuidv4 } from "uuid";
import { LuDelete } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LuListPlus } from "react-icons/lu";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuZap, LuInfinity } from "react-icons/lu";

interface InterviewFormData {
  jobTitle: string;
  jobDescription: string;
  interviewDuration: string;
  interviewType: string[];
  acceptResume: boolean;
}
type InterviewQuestion = {
  question: string;
  type:
  | "Technical"
  | "Behavioral"
  | "Problem Solving"
  | "Leadership"
  | "Experience";
};

type AIResponse = {
  interviewQuestions: InterviewQuestion[];
};

interface InterviewQuestionsProps {
  formData: InterviewFormData;
  onCreateLink: (id: string) => void;
}
const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  formData,
  onCreateLink,
}) => {
  const { users, setRemainingCredits } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const interview_id = uuidv4();
  const [newQuestion, setNewQuestion] = useState("");
  const [newType, setNewType] =
    useState<InterviewQuestion["type"]>("Technical");
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (formData) {
      GenerateAIQna();
    }
  }, [formData]);

  const GenerateAIQna = async () => {
    setLoading(true);
    setIsError(false);

    const startDelay = new Promise((res) => setTimeout(res, 2000));

    try {
      const request = axios.post("/api/ai-model", formData);
      const [result] = await Promise.all([request, startDelay]);
      // console.log("AI Response------------->", result.data);
      // console.log("setQuestions------------->", questions);
      if (result?.data?.isError) {
        console.error("❌ AI Error:", result.data.error);
        toast(result.data.error || "An error occurred during AI generation.");
        setIsError(true);
        return;
      }
      setQuestions(result.data.data.interviewQuestions);
    } catch (e: any) {
      // Improved error reporting for Axios and generic errors so browser
      // shows the server's JSON error body (if any) instead of a vague 500.
      console.error("❌ Request failed:", e);
      // Axios error shape: e.response?.data
      const serverData = e?.response?.data;
      if (serverData && (serverData.error || serverData.isError)) {
        const message = serverData.error || JSON.stringify(serverData);
        console.error("Server response:", serverData);
        toast(message);
      } else if (e?.message) {
        toast(e.message);
      } else {
        toast("A network/server error occurred. Please try again.");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    setSaveLoading(true);

    const userEmail = users?.[0]?.email;
    if (!userEmail) {
      setSaveLoading(false);
      toast("User not loaded. Please re-authenticate.");
      return;
    }

    // Give unlimited credits for the owner account
    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "syedmohammadaquib12@gmail.com";
    const isAdmin = userEmail === ADMIN_EMAIL;

    // Debug auth session to ensure requests carry a valid Supabase session (RLS can fail without it)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("Supabase session check:", {
      hasSession: !!sessionData?.session,
      user: sessionData?.session?.user?.email,
      sessionError,
    });

    let remainingCreditsVal = Number.POSITIVE_INFINITY;

    if (!isAdmin) {
      // get current user credits
      const { data: userData, error: userError, status, statusText } = await supabase
        .from("users")
        // Try common variants; DB column appears to be mis-cased, so request all
        .select("remainingcredits, remaining_credits, remainingCredits")
        .eq("email", userEmail)
        .maybeSingle();

      console.log("Fetched userData:", userData, "email:", userEmail, "status:", status, statusText);
      if (userError) {
        console.error("Supabase user fetch error:", userError);
        console.error("Supabase user fetch error (stringified):", JSON.stringify(userError, null, 2));
        console.error("Email used for query:", userEmail);

        // If the column truly doesn't exist, show a friendly message instead of generic error
        if (userError.code === "42703") {
          setSaveLoading(false);
          setIsDialogOpen(true);
          toast("Credits are not configured for this account. Please contact support.");
          return;
        }

        setSaveLoading(false);
        toast("Error fetching user data");
        return;
      }

      remainingCreditsVal =
        (userData as any)?.remainingCredits ??
        (userData as any)?.remaining_credits ??
        (userData as any)?.remainingcredits ??
        0;

      if (!userData || remainingCreditsVal <= 0) {
        setSaveLoading(false);
        setIsDialogOpen(true);
        toast("No remaining credits!");
        return;
      }
    }

    // insert interview
    const { data, error } = await supabase
      .from("interviews")
      .insert([
        {
          ...formData,
          questionList: questions,
          userEmail: users?.[0]?.email,
          organization: users?.[0]?.organization,
          interview_id: interview_id,
        },
      ])
      .select();

    if (error) {
      console.error("Interview insert error:", error);
      console.error("Interview insert error (stringified):", JSON.stringify(error, null, 2));
      setSaveLoading(false);

      // 404 means table doesn't exist or isn't accessible
      if (error.code === 'PGRST116' || error.message?.includes('404')) {
        toast("The interviews table is not set up. Please configure your Supabase database.");
      } else {
        toast("Error creating interview: " + (error.message || "Unknown error"));
      }
      return;
    }

    // decrement credits in DB
    if (!isAdmin) {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          remainingcredits: remainingCreditsVal - 1,
        })
        .eq("email", users?.[0]?.email)
        .select()
        .single();

      if (!updateError && updatedUser) {
        // also update context so sidebar reflects immediately
        const updatedRemaining =
          (updatedUser as any)?.remainingCredits ??
          (updatedUser as any)?.remaining_credits ??
          (updatedUser as any)?.remainingcredits ??
          0;
        setRemainingCredits(updatedRemaining);
      }

      if (updateError) {
        setSaveLoading(false);
        toast("Error updating credits");
        return;
      }
    } else {
      // For admin, ensure UI reflects "unlimited"
      setRemainingCredits(9999);
    }

    setSaveLoading(false);
    onCreateLink(interview_id);
    toast("Interview is Ready");
  };

  const handleDelete = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;

    setQuestions((prev) => [...prev, { question: newQuestion, type: newType }]);
    setNewQuestion("");
    setNewType("Technical");
    setOpen(false);
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="flex flex-col font-inter font-medium text-center bg-blue-100 px-6 py-4 border border-blue-400 rounded-lg mt-5">
          <p className="text-xl flex items-center justify-center gap-5">
            {" "}
            <LuLoader className="animate-spin transition-all duration-500 text-black text-2xl" />{" "}
            Generating AI Questions
          </p>
          <p className=" text-gray-500 tracking-tight mt-3 text-base">
            AI is generating personlaised Interview Questions tailored according
            to your Job Description and type.
          </p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col font-inter font-medium text-center bg-red-100 px-6 py-4 border border-red-400 rounded-lg mt-5">
          <p className="text-xl flex items-center justify-center gap-5">
            {" "}
            <LuX className=" text-red-500 text-2xl" />
            Error Occured While Generating
          </p>
          <p className=" text-gray-500 tracking-tight mt-3 text-base">
            Its not you , It&apos;s us. Kindly try again generating the
            Questions from AI.
          </p>

          <Button
            className="cursor-pointer bg-red-500 hover:bg-red-600 text-white mt-5 px-4 w-fit mx-auto"
            onClick={() => router.push("/dashboard")}
          >
            Retry{" "}
          </Button>
        </div>
      )}

      {!loading && !isError && questions.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
          className="flex flex-col"
        >
          <h2 className="mb-3 font-semibold font-inter text-xl">
            Generated Questions
          </h2>
          <div className="bg-white px-5 py-4 max-w-[800px] mx-auto rounded-xl">
            <div className="flex items-center justify-end mb-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="mb-4 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                    Add New Question{" "}
                    <LuListPlus className="text-white text-xl" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Interview Question</DialogTitle>
                  </DialogHeader>

                  {/* Input */}
                  <Input
                    placeholder="Enter your question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="mt-2"
                  />

                  {/* Select Type */}
                  <Select
                    value={newType}
                    onValueChange={(value) =>
                      setNewType(value as InterviewQuestion["type"])
                    }
                  >
                    <SelectTrigger className="mt-4">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Behavioral">Behavioral</SelectItem>
                      <SelectItem value="Problem Solving">
                        Problem Solving
                      </SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Experience">Experience</SelectItem>
                    </SelectContent>
                  </Select>

                  <DialogFooter className="mt-4">
                    <Button onClick={handleAddQuestion}>Add Question</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {questions.map((q, i) => (
              <motion.div
                key={i}
                custom={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.3 }}
                className="text-left mb-3"
              >
                <p className="text-lg font-medium tracking-tight text-gray-800 font-inter">
                  {q.question}
                </p>
                <div className="flex items-center justify-between px-2">
                  <p className="text-blue-600 my-2 font-light tracking-tight text-base font-inter">
                    Type: {q.type}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => handleDelete(i)}>
                        <LuDelete className="text-xl" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Separator className="my-2 bg-blue-100" />
              </motion.div>
            ))}
            <div className="flex items-center justify-evenly px-4 mt-3">
              <Button className="cursor-pointer bg-red-500 hover:bg-red-600 text-white mt-5 px-4 w-fit mx-auto">
                Cancel <LuX className="text-xl" />
              </Button>
              <Button
                onClick={onFinish}
                disabled={saveLoading}
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white mt-5 px-4 w-fit mx-auto"
              >
                {saveLoading && (
                  <LuLoader className="animate-spin transition-all duration-500 text-white text-2xl" />
                )}
                {saveLoading ? "Saving..." : "Finish"}
                <LuArrowRight className="text-xl" />
              </Button>
            </div>
            <div className="w-full bg-gradient-to-br from-blue-600 to-pink-300 via-indigo-400 flex items-center justify-end gap-8 p-4 mt-6 rounded-xl">
              <p className="text-white text-lg font-medium tracking-tight font-sora">
                Become Pro User and unlock every features
              </p>
              <Button className="cursor-pointer bg-white hover:bg-gray-100 text-black px-4 ">
                Generate New Questions <LuBrain className="text-xl" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-0 overflow-hidden rounded-2xl max-w-lg">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-br from-blue-500 via-indigo-400 to-pink-300 p-6">
            <DialogTitle className="text-center flex items-center justify-center gap-3 text-white text-2xl font-bold">
              OOPS! <LuX className="w-6 h-6" />
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-100 tracking-wide text-center">
              Looks like you’ve finished all your credits
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 space-y-6">
            <h2 className="text-muted-foreground text-center font-medium">
              To continue making interviews, upgrade your plan now!
            </h2>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan 1 - Small pack */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition rounded-xl">
                <CardHeader className="text-center">
                  <LuZap className="mx-auto text-yellow-500 w-8 h-8 mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    5 More Credits
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Just a quick boost to continue your interviews
                  </p>
                  <p className="text-xl font-bold">₹99</p>
                  <Button className="w-full">Buy Now</Button>
                </CardContent>
              </Card>

              {/* Plan 2 - Unlimited */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition rounded-xl">
                <CardHeader className="text-center">
                  <LuInfinity className="mx-auto text-pink-500 w-8 h-8 mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    Unlimited Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Get unlimited credits and never worry again
                  </p>
                  <p className="text-xl font-bold">₹499 / month</p>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white">
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewQuestions;
