"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, Stars } from "lucide-react";
import { LuAlignRight, LuSend, LuStar } from "react-icons/lu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { runAgent } from "@/lib/AI_Provider/agent";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeProvider";
import { useUserData } from "@/context/UserDetailContext";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "ai";
  text: string;
};

export function SheetDemo() {
  const { users } = useUserData();
  const { darkTheme } = useTheme();
  // ----ai states
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content) {
      toast.error("Please enter a message to send.");
      return;
    }
    if (aiLoading || !users) return;

    setAiLoading(true);
    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      const aiReply = await runAgent(userInput, users[0].id);
      // console.log("AI Reply:", aiReply);
      setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong." },
      ]);
      setAiLoading(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all fixed bottom-10 right-10 group ${darkTheme
          ? "bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-600/30"
          : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
          }`}>
          <Stars className={`text-2xl transition-all ${darkTheme ? "text-white" : "text-white"}`} />
        </div>
      </SheetTrigger>
      <SheetContent className={`${darkTheme ? "bg-slate-900" : "bg-white"} py-6 px-4 border-l ${darkTheme ? "border-slate-700" : "border-blue-100"}`}>
        <SheetHeader>
          <SheetTitle className={`font-extrabold text-xl font-sora tracking-tight flex gap-3 ${darkTheme ? "text-white" : "text-slate-900"}`}>
            INTERVIEWX AI <Stars className={darkTheme ? "text-blue-400" : "text-blue-600"} />
          </SheetTitle>
          <SheetDescription className={`text-sm font-inter tracking-wide mt-3 px-0 leading-relaxed ${darkTheme ? "text-slate-400" : "text-slate-600"}`}>
            I&apos;m an AI agent that can help you with getting started with INTERVIEWX, sending mails to candidates, and solving queries.
          </SheetDescription>
        </SheetHeader>
        {/*---------------- AI MESSAGES DIPLAY--------------------- */}
        <div className="h-full flex flex-col mt-6">
          {messages.length == 0 ? (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className={`p-3 rounded-lg border-2 font-sora text-xs tracking-tight text-center hover:scale-105 transition-all duration-200 cursor-pointer font-medium ${darkTheme
                ? "bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 hover:border-blue-400"
                : "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200 hover:border-blue-500"
                }`}>
                <p>Getting started with creating interviews</p>
              </div>
              <div className={`p-3 rounded-lg border-2 font-sora text-xs tracking-tight text-center hover:scale-105 transition-all duration-200 cursor-pointer font-medium ${darkTheme
                ? "bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 hover:border-blue-400"
                : "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200 hover:border-blue-500"
                }`}>
                <p>Get To know more about INTERVIEWX</p>
              </div>
              <div className={`p-3 rounded-lg border-2 font-sora text-xs tracking-tight text-center hover:scale-105 transition-all duration-200 cursor-pointer font-medium ${darkTheme
                ? "bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 hover:border-blue-400"
                : "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200 hover:border-blue-500"
                }`}>
                <p>Creating Tickets to solve complex quiries</p>
              </div>
              <div className={`p-3 rounded-lg border-2 font-sora text-xs tracking-tight text-center hover:scale-105 transition-all duration-200 cursor-pointer font-medium ${darkTheme
                ? "bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 hover:border-blue-400"
                : "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200 hover:border-blue-500"
                }`}>
                <p>Send Mail To candidates</p>
              </div>
            </div>
          ) : (
            <ScrollArea className={`h-[52vh] px-4 py-3 rounded-lg ${darkTheme ? "bg-slate-800/40" : "bg-blue-50/40"}`}>
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[75%] px-4 py-3 rounded-lg text-sm font-inter font-medium shadow-sm ${msg.role === "user"
                      ? darkTheme
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white self-end shadow-md"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white self-end shadow-md"
                      : darkTheme
                        ? "bg-slate-700 text-slate-100 self-start"
                        : "bg-slate-200 text-slate-900 self-start"
                      }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ))}

                {aiLoading && (
                  <div className={`flex items-center gap-2 self-start px-3 py-2 ${darkTheme ? "text-slate-400" : "text-slate-600"}`}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-medium">Thinking…</span>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* TEXTAREA TO SEND ------------ */}
        <SheetFooter className="shrink-0 mt-6">
          <div className="w-full">
            <Label className={`font-inter text-sm tracking-tight font-semibold ${darkTheme ? "text-white" : "text-slate-900"}`}>
              Send a message
            </Label>
            <div className="relative mt-3">
              <Textarea
                placeholder="Write a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`font-inter text-sm tracking-tight font-medium h-28 resize-none rounded-lg border-2 transition-all ${darkTheme
                  ? "bg-slate-800 text-white placeholder-slate-500 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white text-slate-900 placeholder-slate-400 border-blue-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
              />
              <Button
                className={`absolute right-2 bottom-2 transition-all ${darkTheme
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  }`}
                onClick={sendMessage}
              >
                <LuSend className="text-white" size={18} />
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
