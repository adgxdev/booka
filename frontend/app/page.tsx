'use client';
import Image from "next/image";
import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { GrAnalytics } from "react-icons/gr";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { getUser, storeUser } from "@/utils";
import { ExternalLink, LoaderCircle } from "lucide-react";

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

export default function Home() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [hasReferral, setHasReferral] = useState<null | boolean>(null);
  const [referralCode, setReferralCode] = useState("");
  const [secretCode, setSecretCode] = useState<string>(""); // 🆕
  const [secretError, setSecretError] = useState<string | null>(null); // 🆕
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error("Missing API_URL environment variable");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check secret code before submitting
    if (step === 3) {
      if (secretCode.trim() !== "BK-A92F7") {
        setSecretError("Incorrect code. Please try again.");
        return;
      }
      setSecretError(null);
    }

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
      router.push(`/referrals/${existingUser}`);
    }

  }, [router]);

  return (
    <main className="bg-[#0A192F] text-white h-screen w-full overflow-hidden">
      <Navbar />
      <div className="py-24 xl:py-0 relative w-11/12 mx-auto h-full flex flex-col md:flex-row justify-center items-center">
        {/* Left side image */}
        <div className="opacity-90 xl:opacity-100 h-full w-full xl:w-6/12 flex items-center justify-center xl:justify-end">
          <div className="h-full xl:w-8/12 flex md:items-center justify-end">
            <Image
              src="/images/phonet.png"
              width={500}
              height={500}
              className="h-fit xl:h-11/12 xl:w-fit border"
              alt="booka app"
            />
          </div>
        </div>

        {/* Right side form */}
        <div className="h-full fixed bottom-0 md:relative bg-gradient-to-t to-transparent from-[#0A192F] rounded py-8 w-full xl:w-7/12 flex items-end md:items-center justify-center xl:justify-start">
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-full xl:w-7/12 flex flex-col justify-center items-center text-center"
          >
            <h1 className="w-11/12 xl:w-full bold-text text-[#00C6FF] text-2xl md:text-2xl lg:text-3xl xl:text-2xl font-semibold uppercase leading-7">
              Order textbooks with ease, not queues.
            </h1>
            <p className="w-11/12 text-base mt-4 mb-4">
              A smarter way for students to get their textbooks faster and without stress.
            </p>

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
                      alert("Please enter a valid email address.");
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
                <h2 className="text-[#00C6FF] text-xl md:text-2xl font-semibold uppercase bold-text mb-2">
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
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
                />
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-11/12 mt-4 bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2C – No referral */}
            {step === 2 && hasReferral === false && (
              <div className="mt-6 w-11/12 flex flex-col items-center">
                <p className="text-gray-400 text-sm italic mb-2">
                  No worries — you’re still on the list!
                </p>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded w-full bg-[#00C6FF] py-3 hover:scale-105 hover:cursor-pointer duration-500 uppercase font-normal disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {/* 🆕 Step 3 – Secret Code */}
            {step === 3 && (
              <div className="w-full mt-6 flex flex-col items-center">
                <h2 className="text-[#00C6FF] text-xl md:text-2xl font-semibold uppercase bold-text mb-2">
                  Enter Your Secret Code
                </h2>
                <Link href={'https://forms.gle/owgimo7N3eJS4x3t7'} target="_blank" className="mb-4 flex items-center justify-center gap-1 text-[#FFD166] underline underline-offset-2 hover:text-[#FFC166]/90 w-11/12">
                  <ExternalLink className="h-4 w-4" />
                  <span className="ms-1 text-sm md:text-xs lg:text-sm xl:text-xs">Click here to get code from waitlist form.</span>
                </Link>

                <input
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="Enter your secret code"
                  className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
                />

                {secretError && (
                  <p className="w-11/12 text-red-400 text-sm mt-2">{secretError}</p>
                )}

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
    </main>
  );
}