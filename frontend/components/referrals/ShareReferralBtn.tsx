"use client";
import { useState } from "react";

export default function ShareReferralBtn({
  referralCode,
}: {
  referralCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const message = `🚀 Join me and get early access to Booka — the easiest way to get your books online! 📚  
Use my referral code: ${referralCode}  
Join here: https://www.bookacampus.com`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      className="flex justify-center text-sm items-center text-center font-semibold hover:cursor-pointer bg-[#00C6FF] text-white py-2.5 px-2 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500"
    >
      {copied ? "Copied!" : "Copy Invite"}
    </button>
  );
}