// import Image from "next/image";
import { FaGift } from "react-icons/fa6";

export default function ReferralPage() {
    return (
        <main className="bg-[#0A192F] text-white w-full px-4 py-24 md:py-30">
            <div className="w-11/12 mx-auto text-center">
                <div className="animate-bounce mx-auto h-18 w-18 flex justify-center items-center">
                    <FaGift className="text-[#FFD166] h-24 w-24" />
                </div>
                <h1 className="text-2xl mt-2 font-bold text-[#00C6FF] bold-text">Invite friends, earn rewards</h1>
                <p className="text-sm"></p>
                <div className="mt-4 w-full">
                    <div className="py-1 px-1 rounded-xl w-full md:w-6/12 mx-auto flex justify-center items-center gap-1 text-sm">
                        <input type="email" value={'https://booka-org/referrals/129477'} readOnly className="bg-gray-100 text-black w-9/12 border border-[#3a3737] outline-none rounded-lg py-2 ps-3" name="email" placeholder="Enter your email address" />
                        <button type="submit" className="flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF] text-white py-2 px-3 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500">Copy Link</button>
                    </div>
                    <div className="mt-4 w-full md:w-6/12 mx-auto leading-6 text-sm">
                        <h2 className="w-9/12 mx-auto font-bold mb-4 text-base">For every friend that signs up using your referral link, you both get 10% off your next book order!</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="bg-[#00C6FF] text-white p-3 rounded">
                                <p>Refer 3 friends - Get Early Acess + 10 Booka points</p>
                            </div>
                            <div className="bg-[#00C6FF] text-white p-3 rounded">
                                <p>Refer 5 friends - Get Early Acess + 20 Booka points</p>
                            </div>
                            <div className="bg-[#00C6FF] text-white p-3 rounded">
                                <p>Refer 10 friends - Free Delivery on Your first order + Booka Launch Event Ticket (VIP)</p>
                            </div>
                        </div>
                        <p className="text-[#FFD166]">10 Booka Points = One Free Delivery</p>
                    </div>
                </div>
            </div>
        </main>
    );
}