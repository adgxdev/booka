
import ErrorFragment from "@/components/referrals/ErrorFragment";
import ReferralBox from "@/components/referrals/ReferralBox";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchUserData = async (userId: string) => {
  try {
    const response = await axios.get<ApiResponse<WaitlistData>>(
      `${API_URL}/api/waitlists/${userId}`
    );
    console.log("Referral Data:", response.data.data.waitlist);
    return response.data?.data?.waitlist;
  } catch {
    throw new Error("Failed to load referral data.");
  }
};

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

export default async function ReferralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const waitlistData = await fetchUserData(id);
  const referrals = waitlistData?.referrals?.length ?? 0;

  if (Array.isArray(waitlistData) && waitlistData.length === 0 || !waitlistData) {
    return (
        <ErrorFragment />
    );
  }

  return (
    <ReferralBox referrals={referrals} waitlistData={waitlistData} />
  );
}