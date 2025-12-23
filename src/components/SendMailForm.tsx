"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Mail, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/context/ThemeProvider";
import { useUserData } from "@/context/UserDetailContext";

interface SendMailFormProps {
    defaultEmail?: string;
    defaultSubject?: string;
    defaultBody?: string;
    onSuccess?: () => void;
}

const SendMailForm = ({
    defaultEmail = "",
    defaultSubject = "",
    defaultBody = "",
    onSuccess,
}: SendMailFormProps) => {
    const { darkTheme } = useTheme();
    const { users, setRemainingCredits } = useUserData();
    const [to, setTo] = useState(defaultEmail);
    const [subject, setSubject] = useState(defaultSubject);
    const [body, setBody] = useState(defaultBody);
    const [sending, setSending] = useState(false);

    const userEmail = users?.[0]?.email;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAdmin = userEmail === adminEmail;
    const remainingCredits = users?.[0]?.remainingCredits ?? 0;

    useEffect(() => {
        setTo(defaultEmail);
    }, [defaultEmail]);

    useEffect(() => {
        setSubject(defaultSubject);
    }, [defaultSubject]);

    useEffect(() => {
        setBody(defaultBody);
    }, [defaultBody]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!to.trim() || !subject.trim() || !body.trim()) {
            toast.error("Please fill in email, subject, and message body.");
            return;
        }

        // Check credits before sending
        if (!isAdmin && remainingCredits <= 0) {
            toast.error("No credits remaining. Please purchase credits to send emails.");
            return;
        }

        setSending(true);
        try {
            await axios.post("/api/send-mail", {
                to: to.trim(),
                subject: subject.trim(),
                body: body.trim(),
                userEmail: userEmail,
            });

            // Update local credit count
            if (!isAdmin) {
                setRemainingCredits(remainingCredits - 1);
            }

            toast.success("Mail sent successfully. 1 credit used.");
            onSuccess?.();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to send mail.";
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    const canSend = to.trim() && subject.trim() && body.trim() && !sending;

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="to" className={`text-sm font-semibold font-inter flex items-center gap-2 ${darkTheme ? "text-slate-200" : "text-slate-900"}`}>
                    <UserCheck className={`h-4 w-4 ${darkTheme ? "text-blue-400" : "text-blue-600"}`} />
                    Recipient email
                </Label>
                <Input
                    id="to"
                    type="email"
                    placeholder="candidate@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    className={`h-11 font-inter text-base transition-all rounded-lg ${darkTheme
                        ? "bg-slate-800/80 border border-slate-700 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        }`}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject" className={`text-sm font-semibold font-inter flex items-center gap-2 ${darkTheme ? "text-slate-200" : "text-slate-900"}`}>
                    <Mail className={`h-4 w-4 ${darkTheme ? "text-purple-400" : "text-purple-600"}`} />
                    Subject
                </Label>
                <Input
                    id="subject"
                    placeholder="Interview feedback and next steps"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className={`h-11 font-inter text-base transition-all rounded-lg ${darkTheme
                        ? "bg-slate-800/80 border border-slate-700 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        }`}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="body" className={`text-sm font-semibold font-inter flex items-center gap-2 ${darkTheme ? "text-slate-200" : "text-slate-900"}`}>
                    <Send className={`h-4 w-4 ${darkTheme ? "text-pink-400" : "text-pink-600"}`} />
                    Message
                </Label>
                <Textarea
                    id="body"
                    placeholder="Write your message..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    required
                    className={`resize-none font-inter text-base transition-all rounded-lg ${darkTheme
                        ? "bg-slate-800/80 border border-slate-700 text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
                        : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
                        }`}
                />
                <div className={`flex items-start gap-2 mt-2 p-3 rounded-lg border ${darkTheme
                    ? "bg-slate-800/50 border-slate-700 text-slate-300"
                    : "bg-blue-50 border-blue-200 text-slate-700"}`}>
                    <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${darkTheme ? "bg-blue-400" : "bg-blue-500"}`}></div>
                    <p className={`text-xs font-medium font-inter leading-relaxed ${darkTheme ? "text-slate-300" : "text-slate-700"}`}>
                        <span className="font-semibold">Tip:</span> Keep it concise and include next steps or timelines.
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                className={`w-full h-11 flex items-center justify-center gap-2 font-semibold font-inter rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${canSend
                    ? `${darkTheme
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    }`
                    : darkTheme
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
                disabled={!canSend}
            >
                {sending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" /> Send Mail
                    </>
                )}
            </Button>
        </form>
    );
};

export default SendMailForm;
