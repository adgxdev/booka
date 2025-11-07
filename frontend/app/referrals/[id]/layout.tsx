import { ReactNode } from "react";
import type { Metadata } from "next";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: userId } = await params; 

  return {
    title: `Booka Referral Dashboard – Track Your Referrals & Rewards`,
    description: `View your Booka referral progress and see how many friends have joined through your link. Share your link to unlock exclusive rewards.`,
    openGraph: {
      title: `Booka Referral Dashboard`,
      description: `Track your Booka referrals and reward progress. Earn free book credits, delivery perks, and more.`,
      url: `https://www.bookacampus.com/referrals/${userId}`,
      siteName: "Booka",
      images: [
        {
          url: "https://www.bookacampus.com/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Booka – Referral Dashboard",
        },
      ],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Booka Referral Dashboard`,
      description: `Track and share your Booka referral link to earn book credits and other rewards.`,
      images: ["https://www.bookacampus.com/images/og-image.png"],
    },
    alternates: {
      canonical: `https://www.bookacampus.com/referrals/${userId}`,
    },
  };
}

export default function ReferralLayout({ children }: LayoutProps) {
  return <>{children}</>;
}