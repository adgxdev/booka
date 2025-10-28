'use client';
import ShareReferralBtn from "@/components/ShareReferralBtn";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { FaCheck, FaGift } from "react-icons/fa6";

interface WaitlistData {
  id: string;
  email: string;
  referralCode: string;
  parentCode: string | null;
  createdAt: string;
  referredBy?: WaitlistData | null; // same structure for referredBy
  referrals?: WaitlistData[]; // array of other waitlist entries
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    waitlist: T;
  };
}

export default function ReferralPage({ params, }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async (userId : string) => {
            try {
                setLoading(true);
                const response = await axios.get<ApiResponse<WaitlistData>>(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlists/${userId}`);
                setWaitlistData(response.data?.data?.waitlist);
                setErrorMsg(null);
            } catch (error) {
                if(axios.isAxiosError(error)){
                    setErrorMsg(error.response?.data?.message || "Failed to load referral data.");
                }else {
                    setErrorMsg("An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUserData(id);
    },[id]);

    if (loading) {
        return (
            <main className="bg-[#0A192F] text-white w-full px-4 py-30 md:py-30 min-h-screen">
                <div className="w-full md:w-9/12 lg:w-9/12 2xl:w-7/12 mx-auto text-center">
                    <div className="rounded-lg bg-[#FFD166]/30 animate-pulse mx-auto h-18 w-18 flex justify-center items-center">
                    </div>
                    <div className="w-11/12 md:w-6/12 mx-auto rounded-lg py-3 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                    <div className="w-11/12 md:w-6/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                    <div className="w-8/12 md:w-4/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                    <div className="mt-4 w-full">
                        <div className="py-1 px-1 rounded-xl w-full md:w-8/12 xl:w-7/12 mx-auto flex justify-center items-center gap-1 text-sm">
                            <div className="animate-pulse bg-white/30 text-black w-9/12 border border-[#3a3737]/90 outline-none rounded-lg py-5 ps-3 pe-2" />
                            <div className="animate-pulse flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF]/30 text-white py-5 px-3 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500"></div>
                        </div>
                        <div className="w-full mt-5 flex justify-center items-center flex-col">
                            <div className="w-9/12 md:w-5/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>

                            <div className="w-full">
                                <div className="animate-pulse hidden md:block bg-white/20 w-full mx-auto h-1 mt-4 rounded-lg">
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
                                                className="animate-pulse bg-[#00C6FF]/30 rounded-md relative flex flex-col justify-center items-center pb-12"
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
                            <div className="w-10/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#FFD166]/30"></div>
                        </div>
                    </div>
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

    return (
        <main className="bg-[#0A192F] text-white w-full px-4 py-30 md:py-30 min-h-screen">
            <div className="w-full md:w-9/12 lg:w-9/12 2xl:w-7/12 mx-auto text-center">
                <div className="animate-bounce mx-auto h-18 w-18 flex justify-center items-center">
                    <FaGift className="text-[#FFD166] h-24 w-24" />
                </div>
                <h1 className="text-base md:text-2xl mt-2 mb-2 font-bold text-[#00C6FF] bold-text">Invite friends, earn rewards</h1>
                <h2 className="w-full md:w-6/12 mx-auto font-normal mb-4 text-sm">For every friend that signs up using your referral code, you both get 10% off your next book order!</h2>
                <p className="text-sm"></p>
                <div className="mt-4 w-full">
                    <div className="border py-1 px-1 rounded-xl w-full md:w-8/12 xl:w-7/12 mx-auto flex justify-center items-center gap-1 text-sm">
                        <input type="text" value={`🚀 Join me and get early access to Booka — the easiest way to get your books online! 📚 Use my referral code: ${waitlistData?.referralCode ?? ""} Join here: https://booka-org.vercel.app`} readOnly className="bg-gray-100 text-black w-9/12 border border-[#3a3737] outline-none rounded-lg py-2 ps-3 pe-2" name="email" placeholder="Enter your email address" />
                        <ShareReferralBtn referralCode={waitlistData?.referralCode ?? ""} />
                    </div>
                    <div className="w-full mt-5 flex justify-center items-center flex-col">
                        <h2 className="mt-3 text-base md:text-lg font-medium text-white">So far {" "}
                        {waitlistData?.referrals?.length
                            ? waitlistData.referrals.length
                            : 0}{" "} friends referred. Keep sharing!</h2> 

                        <div className="w-full">
                            <div className="hidden md:block bg-white/20 w-full mx-auto h-1 mt-4 rounded-lg">
                                <div className="bg-[#FFD166] rounded-lg h-full"
                                style={{
                                    width: `${
                                        Math.max(
                                            Math.min(
                                            ((waitlistData?.referrals?.length ?? 0) / 10) * 100,
                                            100
                                            ),
                                            1
                                        )
                                    }%`,
                                }}></div>
                            </div>
                            <div className="w-full flex justify-center">
                                <div className="md:hidden w-1/12 flex items-end">
                                    <div className="h-11/12 w-1.5 rounded-full bg-white/20">
                                        <div className="bg-[#FFD166] rounded-full" 
                                        style={{
                                            height: `${
                                                Math.max(
                                                    Math.min(
                                                    ((waitlistData?.referrals?.length ?? 0) / 10) * 100,
                                                    100
                                                    ),
                                                    1
                                                )
                                            }%`,
                                        }}></div>
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
                                        const achieved = (waitlistData?.referrals?.length ?? 0) >= tier.count;

                                        return (
                                        <div
                                            key={index}
                                            className="bg-[#00C6FF] rounded-md relative flex flex-col justify-center items-center pb-12"
                                        >
                                            <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4">
                                            {tier.count}
                                            </span>

                                            <div className="pt-5 pb-3 px-3">
                                            <p className="text-sm font-medium text-center">{tier.text}</p>
                                            </div>

                                            <div
                                            className={`absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3 transition-opacity duration-300 ${
                                                achieved ? "opacity-100" : "opacity-40"
                                            }`}
                                            >
                                            <FaCheck />
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 w-full md:w-6/12 mx-auto leading-6 text-sm">
                        <p className="text-[#FFD166]">10 Booka Points = One Free Delivery</p>
                    </div>
                </div>
            </div>
        </main>
    );
}