import WaitlistForm from "@/components/waitlist/WaitlistForm";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ ref?: string}>;
}

export default async function WaitlistPage({ searchParams }: PageProps) {
  const { ref = "" } = await searchParams;
  return (
    <main className="bg-[#0A192F] text-white h-screen w-full overflow-hidden">
      <nav className="z-50 max-w-[1440px] mx-auto right-0 left-0 w-full fixed top-0 text-black flex justify-between items-center py-4">
          <div className="w-11/12 mx-auto flex justify-between items-center">
              <Link href={'/'} className="text-lg font-bold tracking-wide">
                  <Image src='/logo/booka.png' alt="booka" className="" width={90} height={10} />
              </Link>
              <div className="">
                  <span className="bg-[#00C6FF] text-white rounded py-2.5 px-3 text-xs flex gap-2 items-center justify-center font-normal hover:scale-102 duration-500 hover:cursor-pointer">
                      Get the App<span className="uppercase text-xs bg-[#FFD166] rounded text-white px-2 py-0.5">Soon</span>
                  </span>
              </div>
          </div>
      </nav>
      <WaitlistForm slug={ref} />
    </main>
  )
}