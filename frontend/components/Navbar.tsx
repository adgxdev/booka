import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="z-50 w-full fixed top-0 text-black backdrop:blur-sm flex justify-between items-center px-4 py-6">
            <div className="w-11/12 mx-auto flex justify-between items-center">
                <Link href="/" aria-label="Home" className="">
                    <h1 className="text-lg bold-text">Booka</h1>
                </Link>
                <div className="">
                    <Link href="/about" className="bg-black text-white rounded-lg py-2.5 px-3 text-sm flex gap-2 items-center bold-text hover:scale-102 duration-500">
                        Get the App<span className="uppercase text-xs bg-white rounded text-black px-2 py-0.5">Soon</span></Link>
                </div>
            </div>
        </nav>
    );
}