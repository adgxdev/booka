"use client";
import RadioBtn from "@/components/RadioBtn";
import SimpleNav from "@/components/SimpleNav";
import { ChevronLeft, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";

export default function ProfilePage() {
    const [isEmailNotificationsActive, setIsEmailNotificationsActive] = useState(false);
    const [isSmsUpdatesActive, setIsSmsUpdatesActive] = useState(false);

    return (
        <main className="w-full min-h-screen relative text-white">
            <SimpleNav />
            <Link href={'#'} className="md:hidden fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="max-w-md h-full w-11/12 mx-auto pb-24">
                <div className="flex flex-col justify-center items-center text-center pt-30 space-y-3">
                    <h1 className="text-2xl font-semibold text-[#00C6FF]">Profile</h1>
                    <div>
                        <CircleUserRound className="text-[#00C6FF] h-24 w-24" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#00C6FF]">Agoha Isdore</h2>
                        <p className="text-sm text-gray-400">Agric Economics and Extension</p>
                    </div>
                </div>
                <div className="flex flex-col mt-10 p-3 border-2 border-[#00C6FF] rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 tracking-tight">Account Settings</h3>
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Email Notifications</span>
                            <RadioBtn 
                                value={isEmailNotificationsActive}
                                onToggle={setIsEmailNotificationsActive}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>SMS Updates</span>
                            <RadioBtn 
                                value={isSmsUpdatesActive}
                                onToggle={setIsSmsUpdatesActive}
                            />
                        </div>
                        <hr className=" bg-gray-500 w-full"/>
                        <div>
                            <h2 className="font-semibold">Referral Stat</h2>
                            <div className="text-xs flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow" />
                                    <span className="text-gray-200">Current points: 120</span>
                                </div>
                                <Link href={'#'} className="rounded py-1 px-2 text-xs flex items-center gap-1 bg-yellow">
                                    <IoIosLink />Refer
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row mt-4 gap-2">
                    <Link href={'#'} className="w-full block bg-linear-to-r from-[#1A73E8] to-[#00C6FF]  py-2 rounded-lg text-center font-semibold hover:bg-[#1A73E8]/50 duration-500">Edit Profile</Link>
                    <button className="w-full bg-red-600 py-2 rounded-lg font-semibold hover:bg-red-500/80 duration-500">Logout</button>
                </div>
            </div>
        </main>
    );
}