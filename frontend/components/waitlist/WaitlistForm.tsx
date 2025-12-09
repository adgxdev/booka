"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getUser, storeUser } from "@/utils";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { GrAnalytics } from "react-icons/gr";
import toast from "react-hot-toast";
import { BsTwitterX } from "react-icons/bs";

interface WaitlistEntry {
  id: string
  email: string
  referralCode: string
  createdAt: string
  parentCode: string | null
}

interface WaitlistResponse {
  success: boolean
  message: string
  data?: {
    waitlistEntry: WaitlistEntry
  }
  error?: {
    entry?: WaitlistEntry
  }
}

export default function WaitlistForm({ slug }: { slug: string }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [hasReferral, setHasReferral] = useState<null | boolean>(null);
  const [referralCode, setReferralCode] = useState(slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error("Missing API_URL environment variable");
  }

  useEffect(() => {
    if (slug) setReferralCode(slug);
  }, [slug]);

  useEffect(() => {
    if (slug) {
      setHasReferral(true);
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = { email, refCode: hasReferral ? referralCode || "" : "" };

    try {
      const res = await axios.post<WaitlistResponse>(
        `${API_URL}/api/waitlists/join`,
        payload
      );

      // handle new user case
      if (res.data.success && res.data.data?.waitlistEntry) {
        const entry = res.data.data.waitlistEntry;
        storeUser(entry.id);
        setMessage('🎉 Successfully joined the waitlist!');
        setTimeout(() => {
          router.push(`/referrals/${entry.id}`);
        }, 1000);
        return;
      } 

      // Something else went wrong (non-success but not an Axios error)
      setMessage(res.data.message || "Something went wrong.");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle already-existing user (409 Conflict)
        if (error.response?.status === 409) {
          const existingEntry = error.response.data?.error?.entry as WaitlistEntry | undefined;
          if (existingEntry) {
            storeUser(existingEntry.id);
            setMessage("🎉 You're already on the waitlist!");
            setTimeout(() => router.push(`/referrals/${existingEntry.id}`), 1000);
            return;
          }
        }

        // Other axios errors
        const errMsg = error.response?.data?.message || "An error occurred. Please try again.";
        setMessage(errMsg);
      } else {
        setMessage("Unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // check for existing user on mount
  useEffect(() => {
    const existingUser = getUser();
    if(existingUser) {
      setUserId(existingUser);
    }
  }, []);
  return (
    <div className="max-w-[1440px] py-24 xl:py-0 relative w-11/12 mx-auto h-full flex flex-col md:flex-row justify-center items-center">
      {/* Left side image */}
      <div className="opacity-95 xl:opacity-100 h-full w-full xl:w-6/12 flex items-center justify-center xl:justify-end">
        <div className="w-full xl:w-7/12 flex xl:items-center justify-end">
          <Image
            src="/images/heromk.png"
            width={500}
            height={500}
            className="w-full h-fit lg:w-fit xl:h-11/12 xl:w-fit 2xl:h-6/12"
            alt="booka's app"
          />
        </div>
      </div>

      {/* Right side form */}
      <div className="h-full fixed bottom-0 md:relative bg-gradient-to-t to-transparent from-[#0A192F] rounded py-8 w-full xl:w-7/12 flex items-end md:items-center justify-center xl:justify-start">
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-full xl:w-7/12 flex flex-col justify-center items-center text-center"
        >
          {step === 1 && (
          <>
            {hasReferral && slug && (
              <div className="bg-yellow/10 border border-yellow rounded-full px-3 py-0.5 text-xs mb-2">
                <h1>You&apos;ve been invited with referral code: <span className="text-yellow">{slug}</span></h1>
              </div>
            )}
            <h1 className="w-11/12 xl:w-full text-blue tracking-tighter text-3xl max-[321px]:text-2xl max-[321px]:leading-6 md:text-3xl lg:text-4xl xl:text-4xl font-bold leading-7">
              Order textbooks with <br className="md:hidden"/>ease, not queues.
            </h1>
            <p className="w-11/12 text-base leading-5 mt-4 mb-4">
              A smarter way for students to get their textbooks faster and without stress.
            </p>
          </>
          )}
          {/* Step 1 – Email input */}
          {step === 1 && (
            <>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
                name="email"
                placeholder="Enter your email address"
              />
                <button
                type="button"
                onClick={() => {
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailPattern.test(email)) {
                    toast("Please enter a valid email address.", {
                      icon: "⚠️",
                    });
                    return;
                  }
                  setStep(2);
                }}
                disabled={!email}
                className="w-11/12 mt-4 flex justify-center items-center text-center hover:cursor-pointer bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base disabled:opacity-50"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 2 – Referral Question */}
          {step === 2 && hasReferral === null && (
            <div className="mt-4 w-11/12 flex flex-col items-center">
              <h2 className="text-[#00C6FF] tracking-tighter text-3xl md:text-3xl font-bold mb-2">
                Were You Referred?
              </h2>
              <p className="text-base text-gray-300 mb-4">
                Let us know if a friend invited you, <br/>you’ll both earn{" "}
                <span className="text-[#FFD166]">Booka Points</span>!
              </p>
              <div className="w-full flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setHasReferral(true)}
                  className="bg-[#00C6FF] w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setHasReferral(false)}
                  className="bg-gray-700 w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Step 2B – Referral Code Input */}
          {step === 2 && hasReferral === true && (
            <div className="w-full mt-6 flex flex-col items-center">
              <p className="font-bold text-xl max-[321px]:text-lg text-gray-300 mb-4">
                Enter your friend’s referral code. <br/>you’ll both earn{" "}
                <span className="text-[#FFD166]">Booka Points</span>!
              </p>
              <input
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={!!slug}  // prevent editing if slug exists
                className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-11/12 mt-4 bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base disabled:opacity-50 flex gap-2 justify-center items-center"
              >
                {isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          )}

          {/* Step 2C – No referral */}
          {step === 2 && hasReferral === false && (
            <div className="mt-6 w-11/12 flex flex-col items-center">
              <p className="text-gray-400 text-lg md:text-lg font-bold italic mb-2">
                No worries — you’re still on the list!
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-11/12 mt-4 bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base disabled:opacity-50 flex gap-2 justify-center items-center"
              >
                {isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          )}

          {/* Message (error or success) */}
          {message && (
            <p
              className={`mt-4 text-sm ${
                message.startsWith('🎉') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message}
            </p>
          )}

          {/* Social Link */}
          <div className="w-11/12 mt-4 flex justify-between items-center">
            <Link
              href={"https://x.com/bookaafrik"}
              target="_blank"
              className="flex items-center gap-1 text-[#FFD166] hover:underline"
            >
              <BsTwitterX className="h-4 w-4" />
              <span className="ms-1 text-sm">Get Updates on X</span>
            </Link>
            {userId ? (
              <Link
                href={`/referrals/${userId}`}
                target="_blank"
                className="flex items-center gap-1 text-[#FFD166] hover:underline"
              >
                <GrAnalytics className="h-4 w-4" />
                <span className="ms-1 text-sm">Track Referrals</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => toast("Join the waitlist to get your referral link!", {
                  icon: "📩",
                })}
                className="flex items-center gap-1 text-gray-400 hover:cursor-help transition-colors"
              >
                <GrAnalytics className="h-4 w-4" />
                <span className="ms-1 text-sm">Track Referrals</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}