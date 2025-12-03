'use client';
import Navbar from "@/components/Navbar";
import ShareReferralBtn from "@/components/ShareReferralBtn";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { use, useEffect, useState } from "react";
import { FaCheck, FaGift } from "react-icons/fa6";

interface WaitlistData {
  id: string;
  email: string;
  referralCode: string;
  parentCode: string | null;
  createdAt: string;
  referrals?: WaitlistData[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    waitlist: T;
  };
}

export default function ReferralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) throw new Error("❌ Missing API_URL environment variable");

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse<WaitlistData>>(`${API_URL}/api/waitlists/${userId}`);
        setWaitlistData(response.data?.data?.waitlist);
        setErrorMsg(null);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMsg(error.response?.data?.message || "Failed to load referral data.");
        } else {
          setErrorMsg("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData(id);
  }, [id, API_URL]);

  if (loading) {
    return (
        <main className="bg-[#0A192F] text-white w-full px-4 py-30 md:py-30 min-h-screen relative">
            <div className="w-full md:w-9/12 lg:w-9/12 2xl:w-7/12 mx-auto text-center">
                <div className="rounded-lg bg-[#FFD166]/30 animate-pulse mx-auto h-18 w-18 flex justify-center items-center">
                </div>
                <div className="w-11/12 md:w-6/12 mx-auto rounded-lg py-3 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                <div className="w-11/12 md:w-7/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                <div className="mt-6 w-full">
                    <div className="bg-white/5 border border-white/10 py-1 px-1 rounded-xl w-full md:w-8/12 xl:w-8/12 mx-auto flex justify-center items-center gap-1 text-sm">
                        <div className="animate-pulse bg-white/30 text-black w-9/12 border border-[#3a3737]/90 outline-none rounded-lg py-5 ps-3 pe-2" />
                        <div className="animate-pulse flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF]/30 text-white py-5 px-3 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500"></div>
                    </div>
                    <div className="w-full mt-5 flex justify-center items-center flex-col">
                        <div className="w-9/12 md:w-3/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>

                        <div className="w-full md:w-9/12">
                            <div className="border border-white/10 animate-pulse hidden md:block bg-white/20 w-full mx-auto h-2 mt-4 rounded-lg">
                                <div className="bg-[#FFD166]/30 rounded-lg h-full w-2/12 animate-pulse"></div>
                            </div>
                            <div className="w-full flex justify-center">
                                <div className="md:hidden w-1/12 flex items-end">
                                    <div className="animate-pulse h-11/12 w-1.5 rounded-full bg-white/20">
                                        <div className="animate-pulse bg-[#FFD166]/30 rounded-full h-2/12"></div>
                                    </div>
                                </div>
                                <div className="mt-8 w-11/12 md:w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        {
                                        count: 3,
                                        text: "Get Early Access + 10 Booka Points",
                                        },
                                        {
                                        count: 5,
                                        text: "Get Early Access + 20 Booka Points",
                                        },
                                        {
                                        count: 10,
                                        text: "Free Delivery on First Order + VIP Launch Ticket",
                                        },
                                    ].map((tier, index) => {
                                        const achieved = 2 >= tier.count;

                                        return (
                                        <div
                                            key={index}
                                            className="animate-pulse bg-white/5 border border-white/10 rounded-md relative flex flex-col justify-center items-center pb-24"
                                        >
                                            <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4 animate-pulse">
                                            </span>

                                            <div className="w-10/12 mx-auto rounded-lg py-1.5 mt-8 mb-2 animate-pulse bg-[#00C6FF]/20"></div>

                                            <div
                                            className={`animate-pulse absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3 transition-opacity duration-300 ${
                                                achieved ? "opacity-100" : "opacity-40"
                                            }`}
                                            >
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 w-full md:w-6/12 mx-auto leading-6 text-sm">
                        <div className="w-9/12 mx-auto rounded-lg py-1 mt-2 mb-2 animate-pulse bg-[#FFD166]/30"></div>
                    </div>
                </div>
            </div>
            <div className="w-full h-screen bg-black/50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <LoaderCircle className="h-8 w-8 animate-spin text-[#FFD166]" />
                </div>
                <span className="text-xs text-[#FFD166]">Loading...</span>
            </div>
            
        </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="bg-[#0A192F] text-white w-full min-h-screen flex items-center justify-center">
        <p className="text-red-400">{errorMsg}</p>
      </main>
    );
  }

  const referrals = waitlistData?.referrals?.length ?? 0;

  return (
    <main className="bg-[#0A192F] text-white w-full min-h-screen py-30 overflow-x-hidden">
      <Navbar />

      <div className="w-11/12 md:w-9/12 mx-auto text-center">
        <FaGift className="text-[#FFD166] h-20 w-20 mx-auto mb-3 animate-bounce" />

        <h1 className="text-lg md:text-3xl font-bold bold-text text-[#00C6FF]">
          Booka Early Referral Program 🎉
        </h1>
        <p className="text-sm md:text-base mt-2 mb-5 text-gray-300">
          Invite your friends, unlock early access, and earn exclusive Booka rewards!
        </p>

        <div className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl p-1 md:p-1 flex flex-row items-center justify-between gap-1.5 w-full md:w-9/12 mx-auto">
          <input
            type="text"
            value={`🚀 Join me on Booka! Use my code ${waitlistData?.referralCode ?? ""} to get early access → https://www.bookacampus.com`}
            readOnly
            className="bg-gray-100 text-black w-7/12 md:w-9/12 border border-[#3a3737] outline-none rounded-lg py-2.5 px-3 text-sm"
          />
          <ShareReferralBtn referralCode={waitlistData?.referralCode ?? ""} />
        </div>

        <p className="mt-5 text-base text-white">
          You’ve referred <span className="text-[#FFD166] font-bold">{referrals}</span> friends.
        </p>
        <div className="w-full flex flex-row md:flex-col">
            {/* Progress Bar (Desktop) */}
            <div className="hidden md:block bg-white/20 border border-white/10 w-full md:w-9/12 mx-auto h-2 mt-4 rounded-full">
                <div
                className="bg-[#FFD166] rounded-full h-full transition-all duration-700"
                style={{
                    width: `${Math.max(
                    Math.min((referrals / 30) * 100, 100),
                    1 // Minimum 1%
                    )}%`,
                }}
                ></div>
            </div>

            {/* Progress Bar (Mobile) */}
            <div className="md:hidden w-1/12 flex items-end">
                <div className="h-11/12 w-1.5 rounded-full bg-white/20">
                <div
                    className="bg-[#FFD166] rounded-full transition-all duration-700"
                    style={{
                        height: `${Math.max(
                            Math.min((referrals / 30) * 100, 100),
                            1 // Minimum 1%
                        )}%`,
                    }}
                ></div>
                </div>
            </div>
            {/* Rewards Tiers */}
            <div className="md:mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-11/12 md:w-9/12">
            {[
                {
                count: 5,
                text: "Early Access + ₦500 Book Credit",
                },
                {
                count: 15,
                text: "Free Delivery OR ₦1,000 Book Credit + Higher Discount",
                },
                {
                count: 30,
                text: "Campus Ambassador + Booka Merchandise 🎓",
                },
            ].map((tier, index) => {
                const achieved = referrals >= tier.count;
                return (
                <div
                    key={index}
                    className={`rounded-xl relative flex flex-col justify-center items-center p-6 border transition-all ${
                    achieved
                        ? "border-[#00C6FF] bg-[#00C6FF]/10"
                        : "border-white/10 bg-white/5"
                    }`}
                >
                    <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] absolute -top-4">
                    {tier.count}
                    </span>
                    <p className="text-sm font-medium text-center text-white mt-4 mb-3">
                    {tier.text}
                    </p>
                    <div
                    className={`rounded-full h-8 w-8 flex justify-center items-center transition-opacity duration-300 ${
                        achieved ? "bg-[#00C6FF] text-white" : "bg-white/20 text-white/40"
                    }`}
                    >
                    <FaCheck />
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        

        {/* Rules Section */}
        <div className="mt-10 w-full md:w-9/12 mx-auto text-left text-sm text-gray-300 space-y-2 border-t border-white/10 pt-6">
          <h3 className="text-[#FFD166] font-semibold mb-2">
            📢 Referral Rules
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Only real, unique student signups count (no duplicates or fake names).</li>
            <li>Referrals must complete the full waitlist form to count.</li>
            <li>Top 20 referrers stand a chance to become Booka Campus Ambassadors.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}