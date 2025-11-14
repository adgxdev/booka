"use client";

import { useState } from "react";

export default function ReferralBox({ onReferralSubmitAction }: { onReferralSubmitAction?: (code: string) => void }) {
  const [hasReferral, setHasReferral] = useState<null | boolean>(null);
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReferralSubmitAction && referralCode) onReferralSubmitAction(referralCode);
  };

  return (
    <div className="w-full md:w-9/12 xl:w-7/12 flex flex-col justify-center items-center text-center mt-8">
      <h2 className="text-[#00C6FF] text-xl md:text-2xl font-semibold uppercase bold-text">
        Were You Referred?
      </h2>
      <p className="text-base text-gray-300 mt-2 mb-4">
        Let us know if a friend invited you, <br/>you’ll both earn <span className="text-[#FFD166]">Booka Points</span>!
      </p>

      {hasReferral === null && (
        <div className="w-11/12 flex gap-4 justify-center">
          <button
            onClick={() => setHasReferral(true)}
            className="bg-[#00C6FF] w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
          >
            Yes
          </button>
          <button
            onClick={() => setHasReferral(false)}
            className="bg-gray-700 w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
          >
            No
          </button>
        </div>
      )}

      {hasReferral && (
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
          />
          <button
            type="submit"
            className="w-11/12 mt-4 bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-bold text-base"
          >
            Submit
          </button>
        </form>
      )}

      {hasReferral === false && (
        <div className="">
          <p className="text-gray-400 mt-6 text-sm italic">
            No worries — you’re still on the list!
          </p>
          <button className="rounded w-full bg-[#00C6FF] py-2 mt-2 hover:scale-102 hover:cursor-pointer duration-500">Continue</button>
        </div>
      )}
    </div>
  );
}