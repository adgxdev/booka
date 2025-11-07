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
      className="flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF] text-white py-2 px-3 rounded-md w-4/12 lg:w-3/12 hover:scale-102 duration-500"
    >
      {copied ? "Copied!" : "Copy Invite"}
    </button>
  );
}