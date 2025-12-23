"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeProvider";
import { useUserData } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import clsx from "clsx";
import { LuArrowRight, LuLoader } from "react-icons/lu";

interface OnboardingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
    const { darkTheme } = useTheme();
    const { users, setUsers } = useUserData();
    const [organization, setOrganization] = useState("");
    const [loading, setLoading] = useState(false);

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organization.trim()) {
            toast.error("Please enter an organization name");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from("users")
                .update({ organization: organization.trim() })
                .eq("email", users?.[0]?.email);

            if (error) {
                toast.error("Failed to update organization");
                setLoading(false);
                return;
            }

            // Update local user state
            if (users) {
                setUsers([
                    {
                        ...users[0],
                        organization: organization.trim(),
                    },
                ]);
            }

            toast.success("Welcome aboard!");
            onOpenChange(false);
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={clsx(
                    "w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden",
                    darkTheme
                        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                        : "bg-gradient-to-br from-white via-blue-50 to-white"
                )}
                showClose={false}
            >
                {/* Decorative gradient top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

                {/* Top brand indicator */}
                <div className={clsx(
                    "px-6 pt-8 pb-2 flex items-center justify-center",
                )}>
                    <div className={clsx(
                        "text-center",
                        darkTheme ? "text-white" : "text-gray-900"
                    )}>
                        <h1 className="text-3xl md:text-4xl font-extrabold font-sora tracking-tight">
                            INTERVIEWX
                        </h1>
                    </div>
                </div>

                <DialogHeader className="space-y-4 px-6 pt-6 pb-4 text-center">
                    <DialogTitle className={clsx(
                        "text-2xl font-bold font-sora tracking-tight",
                        darkTheme ? "text-white" : "text-gray-900"
                    )}>
                        Welcome, {users?.[0]?.name?.split(" ")?.[0]}
                    </DialogTitle>

                    <DialogDescription className={clsx(
                        "text-base leading-relaxed",
                        darkTheme ? "text-slate-300" : "text-gray-600"
                    )}>
                        Before proceeding, please enter your <span className="font-semibold">organization name</span>.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}
                <form onSubmit={handleContinue} className="px-6 pb-6 space-y-5">
                    {/* Organization Input */}
                    <div className="space-y-3">
                        <label className={clsx(
                            "block text-sm font-semibold font-inter",
                            darkTheme ? "text-slate-200" : "text-gray-700"
                        )}>
                            Organization
                        </label>

                        <Input
                            type="text"
                            placeholder="e.g. Vrsa Analytics"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            disabled={loading}
                            className={clsx(
                                "h-12 px-5 rounded-xl border-2 font-inter text-base transition-all duration-300 focus:outline-none",
                                darkTheme
                                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:shadow-lg focus:shadow-blue-500/20"
                                    : "bg-white border-blue-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-300/30"
                            )}
                        />
                    </div>

                    {/* Continue Button */}
                    <Button
                        type="submit"
                        disabled={loading || !organization.trim()}
                        className={clsx(
                            "w-full h-12 rounded-xl font-inter font-bold text-base tracking-tight flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
                            darkTheme
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]"
                        )}
                    >
                        {loading ? (
                            <>
                                <LuLoader className="w-5 h-5 animate-spin" />
                                <span>Continuing...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Decorative elements */}
                <div className={clsx(
                    "absolute top-1/2 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none",
                    darkTheme ? "bg-blue-500" : "bg-blue-400"
                )}></div>

                <div className={clsx(
                    "absolute -bottom-10 -left-20 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none",
                    darkTheme ? "bg-indigo-500" : "bg-indigo-400"
                )}></div>
            </DialogContent>
        </Dialog>
    );
}
