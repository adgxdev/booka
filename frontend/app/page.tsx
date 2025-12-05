import Aurora from "@/components/bits/Aurora";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import SpotlightCard from "@/components/SpotlightCard";
import Image from "next/image";
import Link from "next/link";
import { BsFillLightningFill, BsShieldLockFill } from "react-icons/bs";
import { FaTruckFast } from "react-icons/fa6";
import { MdOutlineDirectionsRun } from "react-icons/md";
import { RiLightbulbFlashFill, RiTruckFill } from "react-icons/ri";

export default function HomePage() {
    return (
        <main className="overflow-x-hidden">
            <Navbar />
            <section className="relative md:min-h-screen w-full h-auto">
                <div className="absolute inset-0 -z-10">
                    <Aurora
                    colorStops={["#FFD166", "#00C6FF", "#FFD166"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                    />
                </div>
                <div className="flex flex-col md:flex-row items-center w-11/12 mx-auto h-auto md:h-full">
                    <div className="h-full w-full md:w-7/12 flex flex-col justify-center md:py-24 pt-24 pb-12">
                        <h1 className="text-5xl md:text-8xl font-semibold md:leading-22 tracking-tighter">
                            <span className="text-2xl md:text-5xl tracking-tighter">Order textbooks</span>
                            <br/>with <span className="text-blue">ease,</span> 
                            <br/>not <span className="text-yellow">queues.</span>
                        </h1>
                        <p className="w-10/12 md:w-full text-base md:text-base tracking-tighter mt-4 mb-8">
                            A smarter way for students to get their textbooks faster and without stress.
                        </p>
                        <Link href={"/waitlist"} className="shadow-xl shadow-blue/20 bg-blue text-white rounded-md py-3 px-6 w-max font-semibold tracking-tighter text-sm md:text-sm hover:scale-105 duration-500">
                            Join the Waitlist
                        </Link>
                    </div>
                    <div className="relative w-full md:w-5/12 flex justify-center pt-12">
                        <div className="h-96 md:h-auto w-full md:w-6/12">
                          <Image src="/images/phonet.png" alt="hero" width={600} height={600} className="object-cover object-top w-full h-full md:rotate-35" />  
                        </div>
                        <div className="md:hidden absolute h-full w-full -bottom-2 bg-gradient-to-b from-transparent via-transparent to-[#0A192F] md:to-transparent">
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="w-full py-16">
                {/* <div className="w-11/12 mx-auto border border-black flex flex-col text-center items-center justify-center space-y-2">
                    <span className="uppercase text-sm text-black">Backed and trusted by the Best</span>
                    <div className="w-full flex justify-between items-center">
                        <Image src='/logo/unilag.png' alt="unilag" className="mx-8" width={90} height={10} />
                        <Image src='/logo/lasu.png' alt="lasu" className="mx-8" width={90} height={10} />
                        <Image src='/logo/abuad.png' alt="abuad" className="mx-8" width={90} height={10} />
                        <Image src='/logo/oau.png' alt="oau" className="mx-8" width={90} height={10} />
                    </div>
                </div> */}
                <div className="w-11/12 mx-auto">                    
                    <h2 className="text-3xl md:text-5xl font-semibold text-center mb-12 tracking-tighter">
                        Why Choose <span className="text-blue">Booka?</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-3">
                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <BsFillLightningFill className="mb-2 text-yellow" size={24} />
                            <h3 className="text-lg tracking-tighter font-semibold mb-2 text-blue">Skip Queues</h3>
                            <p className="text-sm text-gray-300 tracking-tight">No more long lines, order books instantly from your phone or laptop.</p>
                        </SpotlightCard>

                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <RiLightbulbFlashFill className="mb-2 text-yellow" size={24} />
                            <h3 className="text-lg tracking-tighter font-semibold mb-2 text-blue">Instant Info</h3>
                            <p className="text-sm text-gray-300 tracking-tight">See real-time book availability and pricing before making a decision.</p>
                        </SpotlightCard>

                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <FaTruckFast className="mb-2 text-yellow" size={24} />
                            <h3 className="text-lg tracking-tighter font-semibold mb-2 text-blue">Fast Delivery</h3>
                            <p className="text-sm text-gray-300 tracking-tight">Order textbooks from anywhere, no need to visit bookstores, very Swift.</p>
                        </SpotlightCard>

                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <BsShieldLockFill className="mb-2 text-yellow" size={24} />
                            <h3 className="text-lg tracking-tighter font-semibold mb-2 text-blue">Secure Cashless Payments</h3>
                            <p className="text-sm text-gray-300 tracking-tight">Enjoy smooth, cashless, and reliable digital transactions.</p>
                        </SpotlightCard>

                        <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <div className="flex items-center">
                                <MdOutlineDirectionsRun className="mb-2 text-yellow" size={24} />
                                <RiTruckFill className="mb-2 text-yellow" size={24} /> 
                            </div>
                            
                            <h3 className="text-lg tracking-tighter font-semibold mb-2 text-blue">Flexible Pickup</h3>
                            <p className="text-sm text-gray-300 tracking-tight">Choose fast pick-up from a Booka point or delivery to your hostel/class.</p>
                        </SpotlightCard>
                        
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}