import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { TbUserFilled } from "react-icons/tb";

export default function TopNav() {
  return (
    <nav className="w-full py-4 fixed top-0 left-0 flex items-center z-10">
      <div className="max-w-[1440px] w-11/12 mx-auto flex items-center justify-between">
        <Link href={'/'} className="flex items-center gap-2">
            <ChevronLeft className="md:hidden h-8 w-8 text-[#00C6FF]" />
            <Image src='/logo/booka.png' alt="booka" className="" width={90} height={10} />
        </Link>
        <div className="flex justify-center items-center gap-2 md:gap-6 text-blue">
          <Link href="#" className="hover:bg-white/10 duration-500 p-2 rounded-lg">
            <HiOutlineShoppingCart className="h-5 w-5 md:w-5 md:h-5" />
          </Link>
          <Link href="#" className="hover:bg-white/10 duration-500 p-2 rounded-lg">
            <TbUserFilled className="h-5 w-5 md:w-5 md:h-5" />
          </Link>
        </div>
      </div>
    </nav>
  )
}