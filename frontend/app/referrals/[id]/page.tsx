import { FaCheck, FaGift } from "react-icons/fa6";

export default function ReferralPage() {
    return (
        <main className="bg-[#0A192F] text-white w-full px-4 py-24 md:py-30 min-h-screen">
            <div className="w-full md:w-9/12 lg:w-9/12 2xl:w-7/12 mx-auto text-center">
                <div className="animate-bounce mx-auto h-18 w-18 flex justify-center items-center">
                    <FaGift className="text-[#FFD166] h-24 w-24" />
                </div>
                <h1 className="text-base md:text-2xl mt-2 mb-2 font-bold text-[#00C6FF] bold-text">Invite friends, earn rewards</h1>
                <h2 className="w-full md:w-6/12 mx-auto font-normal mb-4 text-sm">For every friend that signs up using your referral link, you both get 10% off your next book order!</h2>
                <p className="text-sm"></p>
                <div className="mt-4 w-full">
                    <div className="border py-1 px-1 rounded-xl w-full md:w-8/12 xl:w-7/12 mx-auto flex justify-center items-center gap-1 text-sm">
                        <input type="email" value={'https://booka-org/referrals/129477'} readOnly className="bg-gray-100 text-black w-9/12 border border-[#3a3737] outline-none rounded-lg py-2 ps-3 pe-2" name="email" placeholder="Enter your email address" />
                        <button type="submit" className="flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF] text-white py-2 px-3 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500">Copy Link</button>
                    </div>
                    <div className="w-full mt-5 flex justify-center items-center flex-col">
                        {/* <div className="flex flex-col items-center justify-center h-20 aspect-square rounded-full border-2 border-[#00C6FF] text-[#00C6FF]">
                            <span className="bold-text leading-4 mt-1 text-lg">4</span>
                            <span className="text-[10px] font-medium">refferals</span>
                        </div> */}
                        <h2 className="mt-3 text-base md:text-lg font-medium text-white">So far 5 friends referred. Keep sharing!</h2>

                        <div className="w-full">
                            <div className="hidden md:block bg-white w-full h-1 mt-4 rounded-lg">
                                <div className="bg-[#FFD166] rounded-lg h-full w-6/12"></div>
                            </div>
                            <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#00C6FF] rounded-md relative flex flex-col justify-center items-center pb-12">
                                    <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4">3</span>
                                    <div className="pt-5 pb-3 px-3">
                                        <p className="text-sm font-medium">Get Early Acess + 10 Booka points</p>
                                    </div>
                                    <div className="absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3">
                                        <FaCheck />
                                    </div>
                                </div>
                                <div className="bg-[#00C6FF] rounded-md relative flex flex-col justify-center items-center pb-12">
                                    <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4">5</span>
                                    <div className="pt-5 pb-3 px-3">
                                        <p className="text-sm font-medium">Get Early Acess + 20 Booka points</p>
                                    </div>
                                    <div className="absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3">
                                        <FaCheck />
                                    </div>
                                </div>
                                <div className="bg-[#00C6FF] rounded-md relative flex flex-col justify-center items-center pb-12">
                                    <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4">10</span>
                                    <div className="pt-5 pb-3 px-3">
                                        <p className="text-sm font-medium">Free Delivery on Your first order + Booka Launch Event Ticket (VIP)
                                        </p>
                                    </div>
                                    <div className="absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3">
                                        <FaCheck />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 w-full md:w-6/12 mx-auto leading-6 text-sm">
                        <p className="text-[#FFD166]">10 Booka Points = One Free Delivery</p>
                    </div>
                </div>
            </div>
        </main>
    );
}