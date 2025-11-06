import { ChevronLeft, CircleUserRound } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <main className="w-full min-h-screen relative text-white">
            <Link href={'#'} className="fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="h-full w-11/12 mx-auto">
                <div className="flex flex-col justify-center items-center text-center pt-30 space-y-2">
                    <h1 className="text-2xl font-bold text-[#00C6FF]">Profile</h1>
                    <div>
                        <CircleUserRound className="text-[#00C6FF] h-24 w-24" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#00C6FF]">Agoha Isdore</h2>
                        <p className="text-sm text-gray-400">Agric Economics and Extension</p>
                    </div>
                </div>
                <div className="flex flex-col mt-10 p-3 border-2 border-[#00C6FF] rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between">
                            <span>Email Notifications</span>

                        </div>
                        <div className="flex justify-between">
                            <span>SMS Updates</span>
                        </div>
                        <hr className=" bg-gray-500 w-full"/>
                        <div>
                            <h2>Referral Stat</h2>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}