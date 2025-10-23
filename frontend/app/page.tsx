import Image from "next/image";
import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";

export default function Home() {
  return (
      <main className="bg-[#0A192F] text-white h-dvh w-full overflow-hidden">
        <section className="py-24 xl:py-0 relative w-11/12 mx-auto h-full flex flex-col md:flex-row justify-center items-center">
          <div className="opacity-90 xl:opacity-100 h-full w-full xl:w-6/12 flex items-center justify-center md:justify-center xl:justify-end">
            <div className="h-full xl:w-8/12 flex md:items-center justify-end">
              <Image src='/images/phone.png' width={500} height={500} className="h-fit xl:h-11/12 xl:w-fit border" alt="booka app" />
            </div>
          </div>
          <div className="h-full fixed bottom-0 md:bottom-0 md:relative bg-gradient-to-t to-transparent from-[#0A192F] rounded py-8 w-full xl:w-7/12 flex items-end md:items-center justify-center xl:items-center xl:justify-start">
            <div className="w-full md:w-full xl:w-7/12 flex flex-col justify-center items-center text-center">
              <h1 className="w-11/12 xl:w-full bold-text text-[#00C6FF] text-2xl md:text-2xl lg:text-3xl xl:text-2xl font-semibold uppercase leading-7">Order textbooks with ease, not queues.</h1>
              <p className="w-11/12 font-light text-sm md:text-xs mt-4 mb-4">A smarter way for students to get their  books faster, cheaper and stress free, Skip the long queues, save money, and get your books with ease.</p>
              <div className="w-full text-sm flex justify-center items-center flex-col">
                <input type="email" className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded" name="email" placeholder="Enter your email address" />
                <div className="w-full flex justify-center items-center mt-4">
                  <button type="submit" className="w-11/12 flex justify-center items-center text-center hover:cursor-pointer bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-102 duration-500 uppercase font-normal text-base">Join waitlist</button>
                </div>
                
              </div>
              <div className="mt-4">
                <Link href={'https://x.com/bookaafrik'} target="_blank" className="flex items-center gap-1 text-[#FFD166] hover:underline">
                  <BsTwitterX className="h-4 w-4" /><span className="ms-2 text-sm">Follow us on X for updates</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
