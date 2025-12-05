"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    return (
        <nav className="z-50 w-full text-white py-4 fixed top-0">
            <header className="w-11/12 mx-auto flex items-center justify-between">
                <Link href={'/'} className="text-lg font-bold tracking-wide">
                    <Image src='/logo/booka.png' alt="booka" className="" width={90} height={10} />
                </Link>
                <div className="hidden md:flex gap-9 items-center text-sm font-semibold tracking-tighter">
                    <Link href={'#'} className="hover:text-blue duration-500">About</Link>
                    <Link href={'#'} className="hover:text-blue duration-500">Services</Link>
                    <Link href={'#'} className="hover:text-blue duration-500">Contact Us</Link>
                    <Link href={'/waitlist'} className="shadow-xl shadow-blue/20 bg-blue text-white rounded-md py-2.5 px-4 font-semibold hover:scale-105 duration-500">Join the Waitlist</Link>
                </div>
                <button onClick={() => setOpen(true)} className="md:hidden rounded-md">
                    <Menu className="h-6 w-6 text-white" />
                </button>
            </header>
            {/* Mobile Menu Drawer */}
            <div
                className={`fixed top-0 right-0 h-68 rounded-b-3xl w-full bg-[#0A192F]/70 backdrop-blur-sm border-b border-white/10 shadow-xl transform transition-transform duration-300 md:hidden ${
                open ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <Link href={'/'} className="text-lg font-bold tracking-wide">
                        <Image src='/logo/booka.png' alt="booka" className="" width={90} height={10} />
                    </Link>
                    <button onClick={() => setOpen(false)}>
                        <X className="h-6 w-6 text-white" />
                    </button>
                </div>

                <div className="flex flex-col items-start gap-6 text-sm px-6 font-medium mt-4">
                <Link onClick={() => setOpen(false)} href="#" className="hover:text-blue duration-300">
                    About
                </Link>
                <Link onClick={() => setOpen(false)} href="#" className="hover:text-blue duration-300">
                    Services
                </Link>
                <Link onClick={() => setOpen(false)} href="#" className="hover:text-blue duration-300">
                    Contact Us
                </Link>

                <Link
                    onClick={() => setOpen(false)}
                    href="/waitlist"
                    className="w-full bg-blue text-white rounded-md py-2.5 px-4 font-semibold text-center hover:scale-105 duration-300"
                >
                    Join the Waitlist
                </Link>
                </div>
            </div>
        </nav>
    );
}