import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="z-50 w-full fixed top-0 text-black backdrop:blur-sm flex justify-between items-center px-4 py-6">
            <div className="w-11/12 mx-auto flex justify-between items-center">
                <Link href="/" aria-label="Home" className="">
                    <h1 className="text-[#00C6FF] text-lg font-bold bold-text">Booka</h1>
                </Link>
                <div className="">
                    <span className="bg-[#00C6FF] text-white rounded py-2.5 px-3 text-sm flex gap-2 items-center justify-center font-normal hover:scale-102 duration-500 hover:cursor-pointer">
                        Get the App<span className="uppercase text-xs bg-[#FFD166] rounded text-white px-2 py-0.5">Soon</span>
                    </span>
                </div>
            </div>
        </nav>
    );
}