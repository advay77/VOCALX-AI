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
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all fixed bottom-10 right-10">
          <Stars className="text-2xl text-blue-600" />
        </div>
      </SheetTrigger>
      <SheetContent className="bg-slate-800 py-4 px-2">
        <SheetHeader>
          <SheetTitle className="font-extrabold text-lg text-white font-sora tracking-tight flex gap-3">
            INTERVIEWX AI <Stars className="text-blue-400" />
          </SheetTitle>
          <SheetDescription className="text-sm font-inter tracking-wide mt-2 text-gray-400 px-1">
            I&apos;m an AI agent that can help you with getting started with
            INTERVIEWX, sending mails to candidates, solving quiries.
          </SheetDescription>
        </SheetHeader>
        {/*---------------- AI MESSAGES DIPLAY--------------------- */}
        <div className="h-full flex flex-col ">
          {messages.length == 0 ? (
            <div className="grid grid-cols-2 gap-4 px-2 mt-5">
              <div className="p-2 rounded-sm bg-blue-200 border-2 cursor-none border-blue-600 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Getting started with creating interviews</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Get To know more about INTERVIEWX</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Creating Tickets to solve complex quiries</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Send Mail To candidates</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[52vh] px-4 py-2">
              <div className="flex flex-col gap-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[75%] px-3 py-2 rounded-md text-sm font-inter ${msg.role === "user"
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200/10 text-gray-200 self-start"
                      }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex items-center gap-2 text-gray-500 self-start">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Thinking…</span>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* TEXTAREA TO SEND ------------ */}
        <SheetFooter className="shrink-0">
          <div>
            <Label className="text-white font-inter text-sm tracking-tight font-medium mt-2 mb-2">
              Send a message
            </Label>
            <div className="relative">
              <Textarea
                placeholder="Write a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-black text-gray-200 font-inter text-sm tracking-tight font-medium mt-2 mb-2 h-28 resize-none"
              />
              <Button
                className="absolute right-2 bottom-2 bg-gray-600"
                onClick={sendMessage}
              >
                <LuSend className="text-white" size={10} />
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
