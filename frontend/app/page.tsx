"use client";
import Aurora from "@/components/bits/Aurora";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import SpotlightCard from "@/components/SpotlightCard";
import Image from "next/image";
import Link from "next/link";
import { BsFillLightningFill, BsShieldLockFill } from "react-icons/bs";
import { FaHandshakeSimple, FaTruckFast } from "react-icons/fa6";
import { RiLightbulbFlashFill } from "react-icons/ri";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HomePage() {
    const pathname = usePathname();
    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [pathname]);
    return (
        <main className="overflow-x-hidden min-h-screen">
            <Navbar />
            <section className="relative xl:min-h-screen w-full hmin-h-screen md:h-auto 2xl:min-h-auto 2xl:py-24">
                <div className="absolute inset-0 -z-10">
                    <Aurora
                    colorStops={["#FFD166", "#00C6FF", "#FFD166"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                    />
                </div>
                <div className="max-w-[1440px] mx-auto py-12 md:pt-28 mb-0 flex flex-col md:flex-row items-center w-11/12 h-full md:h-auto 2xl:h-auto">
                    <div data-aos="fade-right" className="pt-24 pb-12 md:pt-0 md:pb-24 2xl:ps-12 h-full w-full md:w-6/12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                        <h1 className="text-5xl md:text-5xl lg:text-6xl xl:text-8xl font-semibold xl:leading-22 tracking-tighter">
                            <span className="text-2xl md:text-2xl lg:text-3xl xl:text-5xl tracking-tighter">Order textbooks</span>
                            <br/>with <span className="text-blue">ease,</span> 
                            <br/>not <span className="text-yellow">queues.</span>
                        </h1>
                        <p className="w-10/12 md:w-9/12 xl:w-full text-base md:text-sm xl:text-sm tracking-tight mt-6 mb-4">
                            A smarter way for students to get their textbooks faster and without stress.
                        </p>
                        <Link href={"/waitlist"} className="shadow-xl shadow-blue/20 bg-blue text-white rounded-md py-3 px-6 w-max font-semibold tracking-tighter text-sm md:text-sm hover:scale-105 duration-500">
                            Join the Waitlist
                        </Link>
                    </div>
                    <div className="relative w-full md:w-6/12 flex justify-center">
                        <div data-aos="fade-up" className="h-96 md:h-auto w-full md:w-10/12">
                          <Image src="/images/heromk.png" alt="hero" width={600} height={600} className="object-contain md:object-cover object-top w-full h-full" />  
                        </div>
                        {/* <div className="md:hidden absolute h-full w-full -bottom-2 bg-gradient-to-b from-transparent via-transparent to-[#0A192F] md:to-transparent">
                        </div> */}
                    </div>
                </div>
            </section>
            
            <section className="max-w-[1440px] mx-auto w-full py-16 2xl:mb-64">
                
                {/* <div className="w-11/12 mx-auto border border-black flex flex-col text-center items-center justify-center space-y-2">
                    <span className="uppercase text-sm text-black">Backed and trusted by the Best</span>
                    <div className="w-full flex justify-between items-center">
                        <Image src='/logo/unilag.png' alt="unilag" className="mx-8" width={90} height={10} />
                        <Image src='/logo/lasu.png' alt="lasu" className="mx-8" width={90} height={10} />
                        <Image src='/logo/abuad.png' alt="abuad" className="mx-8" width={90} height={10} />
                        <Image src='/logo/oau.png' alt="oau" className="mx-8" width={90} height={10} />
                    </div>
                </div> */}
                <div className="2xl:w-full w-11/12 mx-auto mb-12">                    
                    <h2 className="text-2xl md:text-3xl xl:text-5xl font-semibold text-center mb-9 md:mb-12 tracking-tighter">
                        Why Choose <span className="text-blue">Booka?</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
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
                                <FaHandshakeSimple className="mb-2 text-yellow" size={24} />
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