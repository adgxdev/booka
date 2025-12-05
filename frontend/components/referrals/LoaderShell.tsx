import { LoaderCircle } from "lucide-react";

export default function LoaderShell() {
  return (
    <main className="bg-[#0A192F] text-white w-full px-4 py-30 md:py-30 min-h-screen relative">
            <div className="w-full md:w-9/12 lg:w-9/12 2xl:w-7/12 mx-auto text-center">
                <div className="rounded-lg bg-[#FFD166]/30 animate-pulse mx-auto h-18 w-18 flex justify-center items-center">
                </div>
                <div className="w-11/12 md:w-6/12 mx-auto rounded-lg py-3 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                <div className="w-11/12 md:w-7/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>
                <div className="mt-6 w-full">
                    <div className="bg-white/5 border border-white/10 py-1 px-1 rounded-xl w-full md:w-8/12 xl:w-8/12 mx-auto flex justify-center items-center gap-1 text-sm">
                        <div className="animate-pulse bg-white/30 text-black w-9/12 border border-[#3a3737]/90 outline-none rounded-lg py-5 ps-3 pe-2" />
                        <div className="animate-pulse flex justify-center items-center text-center font-bold hover:cursor-pointer bg-[#00C6FF]/30 text-white py-5 px-3 rounded-md w-5/12 lg:w-3/12 hover:scale-102 duration-500"></div>
                    </div>
                    <div className="w-full mt-5 flex justify-center items-center flex-col">
                        <div className="w-9/12 md:w-3/12 mx-auto rounded-lg py-1.5 mt-2 mb-2 animate-pulse bg-[#00C6FF]/30"></div>

                        <div className="w-full md:w-9/12">
                            <div className="border border-white/10 animate-pulse hidden md:block bg-white/20 w-full mx-auto h-2 mt-4 rounded-lg">
                                <div className="bg-[#FFD166]/30 rounded-lg h-full w-2/12 animate-pulse"></div>
                            </div>
                            <div className="w-full flex justify-center">
                                <div className="md:hidden w-1/12 flex items-end">
                                    <div className="animate-pulse h-11/12 w-1.5 rounded-full bg-white/20">
                                        <div className="animate-pulse bg-[#FFD166]/30 rounded-full h-2/12"></div>
                                    </div>
                                </div>
                                <div className="mt-8 w-11/12 md:w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        {
                                        count: 3,
                                        text: "Get Early Access + 10 Booka Points",
                                        },
                                        {
                                        count: 5,
                                        text: "Get Early Access + 20 Booka Points",
                                        },
                                        {
                                        count: 10,
                                        text: "Free Delivery on First Order + VIP Launch Ticket",
                                        },
                                    ].map((tier, index) => {
                                        const achieved = 2 >= tier.count;

                                        return (
                                        <div
                                            key={index}
                                            className="animate-pulse bg-white/5 border border-white/10 rounded-md relative flex flex-col justify-center items-center pb-24"
                                        >
                                            <span className="text-sm h-8 w-8 font-bold flex justify-center items-center rounded-full bg-[#FFD166] aspect-square absolute -top-4 animate-pulse">
                                            </span>

                                            <div className="w-10/12 mx-auto rounded-lg py-1.5 mt-8 mb-2 animate-pulse bg-[#00C6FF]/20"></div>

                                            <div
                                            className={`animate-pulse absolute bottom-0 rounded-full bg-white text-[#00C6FF] h-8 w-8 flex justify-center items-center mb-3 transition-opacity duration-300 ${
                                                achieved ? "opacity-100" : "opacity-40"
                                            }`}
                                            >
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 w-full md:w-6/12 mx-auto leading-6 text-sm">
                        <div className="w-9/12 mx-auto rounded-lg py-1 mt-2 mb-2 animate-pulse bg-[#FFD166]/30"></div>
                    </div>
                </div>
            </div>
            <div className="w-full h-screen bg-black/50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <LoaderCircle className="h-8 w-8 animate-spin text-[#FFD166]" />
                </div>
                <span className="text-xs text-[#FFD166]">Loading...</span>
            </div>
            
        </main>
  );
}