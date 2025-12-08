import { FaCheck, FaGift } from "react-icons/fa6";
import Navbar from "../Navbar";
import ShareReferralBtn from "@/components/referrals/ShareReferralBtn";

interface WaitlistData {
  id: string;
  email: string;
  referralCode: string;
  parentCode: string | null;
  createdAt: string;
  referrals?: WaitlistData[];
}

interface ReferralBoxProps {
  waitlistData: WaitlistData;
  referrals: number;
}

export default function ReferralBox({ waitlistData, referrals }: ReferralBoxProps) {
  return (
    <main className="bg-[#0A192F] text-white w-full min-h-screen py-30 overflow-x-hidden">
      <Navbar />

      <div className="w-11/12 md:w-9/12 mx-auto text-center">
        <FaGift className="text-[#FFD166] h-16 w-16 mx-auto mb-3 animate-bounce" />

        <h1 className="text-lg md:text-3xl font-bold text-[#00C6FF]">
          Booka Early Referral Program
        </h1>
        <p className="text-sm md:text-base mt-2 mb-5 text-gray-300">
          Invite your friends, unlock early access, and earn exclusive Booka rewards!
        </p>

        <div className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl p-1 md:p-1 flex flex-row items-center justify-between gap-1.5 w-full md:w-9/12 mx-auto">
          <input
            type="text"
            value={`Join me on Booka! Use my code ${waitlistData?.referralCode ?? ""} to get early access → https://www.bookacampus.com/waitlist?ref=${waitlistData?.referralCode ?? ""}`}
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