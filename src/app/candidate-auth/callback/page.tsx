"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function CandidateOnboarding() {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");

  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (step === 2) {
      const id = uuidv4().slice(0, 8);
      setReferralLink(`${window.location.origin}/ref/${id}`);
    }
  }, [step]);

  function handleNext() {
    if (!name || !phone || !occupation) {
      toast("Please complete all fields.");
      return;
    }
    setStep(2);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(referralLink);
    toast.info("Referral link copied!");
  }

  function handleSubmit() {
    const data = {
      name,
      phone,
      occupation,
      referralLink,
    };

    console.log("🎉 Final Onboarding Data:", data);
    // later: supabase.from("candidates").update(...)
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />

      <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl mt-10 relative overflow-hidden">
        <h1 className="font-sora text-center text-xl">Welcome To <span className="font-extrabold">INTERVIEWX</span></h1>
        <p className="font-inter text-sm tracking-tight text-center my-2">Kindly Fill Your Details for your smooth onboarding</p>
        {/* STEP INDICATOR */}
        <div className="flex justify-center gap-3 mt-4">
          <div
            className={`w-3 h-3 rounded-full ${step === 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${step === 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
          ></div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 font-inter">
            <h2 className="text-lg font-medium font-inter">Your Details</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="Ronit Rai"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Current Occupation
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md text-sm "
                placeholder="Student / Working Professional"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700"
            >
              Next Step →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Referral Link</h2>
            <p className="text-gray-600">Share this link with your friends.</p>

            <div className="flex items-center gap-2 border px-3 py-2 rounded-md">
              <input
                className="w-full bg-transparent"
                value={referralLink}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Copy
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700"
            >
              Finish 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
