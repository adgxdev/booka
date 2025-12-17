import TopNav from "@/components/common/TopNav";
import SearchComponent from "@/components/search/SearchComponent";
import Image from "next/image";
import { RiDeleteBinLine } from "react-icons/ri";

export default function CartsPage() {
  return (
    <main className="w-full min-h-screen relative text-white">
      <TopNav />
      <section className="max-w-[1440px] w-11/12 mx-auto py-20">
        <h1 className="font-semibold tracking-tighter text-lg mb-2">My Carts</h1>
        <SearchComponent />
        <div className="pb-2 w-full md:w-6/12 mt-3 bg-dblue divide-y divide-bg rounded-lg grid grid-cols-1 gap-2">
          <div className="p-1.5 flex items-center gap-2">
            <div className="w-3/12 rounded">
              <Image src="/images/book1.png" alt="" className="rounded" height={400} width={400} />           
            </div>
            <div className="w-full flex justify-between items-center">
              <div>
                <h1 className="text-base font-semibold tracking-tighter mb-1">Whispers in the mist</h1>
                <p className="text-sm">Dr. Chibuike</p>
                <span className="text-sm font-semibold">₦5,000</span>
              </div>
              <div className="flex flex-col items-end justify-between gap-3">
                <button className="hover:bg-white/10 p-1.5 rounded-md duration-500">
                  <RiDeleteBinLine className="h-5 w-5" />
                </button>
                <div className="bg-yellow text-black rounded-lg px-2 py-0.5 flex items-center gap-2.5">
                  <button>-</button>
                  <span className="px-2 bg-white rounded">1</span>
                  <button>+</button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-1.5 tracking-tight pt-1">
            <h1 className="text-sm">Subtotal: <span className="font-semibold">₦10,000</span></h1>
            <p className="text-sm">Service fee <span className="font-semibold mb-1">(₦400)</span></p>
            <span className="text-lg font-bold text-yellow mt-1">Order total: ₦10,400</span>
          </div>
        </div>
        <div className="w-full md:w-6/12 mt-6 flex justify-center items-center">
          <button className="w-full rounded-lg bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-sm py-3 px-3 text-white hover:scale-102 duration-500">Proceed to payment</button>
        </div>
      </section>
    </main>
  );
}