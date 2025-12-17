"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Mail, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    const [to, setTo] = useState(defaultEmail);
    const [subject, setSubject] = useState(defaultSubject);
    const [body, setBody] = useState(defaultBody);
    const [sending, setSending] = useState(false);

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

        setSending(true);
        try {
            await axios.post("/api/send-mail", {
                to: to.trim(),
                subject: subject.trim(),
                body: body.trim(),
            });
            toast.success("Mail sent successfully.");
            onSuccess?.();
        } catch (err: any) {
            const message = err?.response?.data?.error || "Failed to send mail.";
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    const canSend = to.trim() && subject.trim() && body.trim() && !sending;

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
                <Label htmlFor="to" className="text-sm font-semibold font-inter flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    Recipient email
                </Label>
                <Input
                    id="to"
                    type="email"
                    placeholder="candidate@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    className="h-10 font-inter border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-semibold font-inter flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    Subject
                </Label>
                <Input
                    id="subject"
                    placeholder="Interview feedback and next steps"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="h-10 font-inter border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="body" className="text-sm font-semibold font-inter flex items-center gap-2">
                    <Send className="h-4 w-4 text-pink-600" />
                    Message
                </Label>
                <Textarea
                    id="body"
                    placeholder="Write your message..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    required
                    className="resize-none font-inter border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <div className="flex items-start gap-2 mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-shrink-0 w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                    <p className="text-xs text-blue-700 font-medium font-inter">
                        <span className="font-bold">Tip:</span> Keep it concise and include next steps or timelines.
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold font-inter rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
