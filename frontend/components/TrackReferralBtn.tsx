'use server';
import Link from "next/link";
import { cookies } from "next/headers";
import { GrAnalytics } from "react-icons/gr";

export default async function TrackReferralBtn() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return (
      <p className="text-gray-400 text-sm italic">
        Join first to get your referral link.
      </p>
    );
  }

  return (
    <Link
      href={`/referrals/${userId}`}
      className="flex items-center gap-1 text-[#FFD166] hover:underline"
    >
      <GrAnalytics className="h-4 w-4" />
      <span className="ms-1 text-sm">Track My Referrals</span>
    </Link>
  );
}