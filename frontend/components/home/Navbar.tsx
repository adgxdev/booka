import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="z-50 w-full text-white py-4 fixed top-0">
            <header className="w-11/12 mx-auto flex items-center justify-between">
                <Link href={'/'} className="text-lg font-bold tracking-wide">
                    <Image src='/logo/booka.png' alt="booka" className="" width={90} height={10} />
                </Link>
                <div className="flex gap-9 items-center text-xs font-semibold tracking-tight">
                    <Link href={'/'} className="hover:text-blue duration-500">About</Link>
                    <Link href={'/'} className="hover:text-blue duration-500">Services</Link>
                    <Link href={'/'} className="hover:text-blue duration-500">Contact Us</Link>
                    <Link href={'/'} className="bg-blue text-white rounded-md py-2.5 px-4 font-semibold">Join Waitlist</Link>
                </div>
            </header>
        </nav>
    );
}