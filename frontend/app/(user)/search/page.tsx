// interface SearchPageProps {
//   searchParams: { q?: string };
import TopNav from "@/components/common/TopNav";
import Image from "next/image";
import { ImSearch } from "react-icons/im";

export default async function SearchPage() {
  // const q = searchParams.q || "";
  // const posts = q ? await searchPosts(q) : [];
  return (
    <main className="w-full min-h-screen relative text-white">
      <TopNav />
      <section className="max-w-[1440px] w-11/12 mx-auto py-20">
        <h1 className="text-blue font-semibold mb-2 text-lg tracking-tighter">Welcome, Isdore</h1>
        <div className="w-full md:w-6/12 bg-dblue rounded-lg flex items-center gap-1 px-1.5 py-1">
          <input type="text" placeholder="Find books by course or title" className="placeholder-gray-500 ps-2 w-full md:w-10/12 border-none outline-none py-1.5 rounded-lg bg-white" name="q" />
          <button className="w-1/12 md:w-2/12 flex items-center justify-center gap-2 px-1">
            <ImSearch className="h-5 w-5" /><span className="hidden md:block font-medium">Search</span>
          </button>
        </div>

        <div className="mt-4">
          <h1 className="text-[#D9D9D9] tracking-tight">Recently Searched</h1>
          <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-2">
            <div className="hover:bg-white/5 rounded p-1">
              <div className="h-auto w-auto md:h-42 md:w-42">
                <Image src='/images/book1.png' alt="book1" className="aspect-square rounded" height={500} width={500} />
              </div>
              <div className="mt-1">
                <h2 className="tracking-tighter text-xs md:text-sm truncate">Whispers in mist</h2>
                <p className="text-[10px] md:text-xs tracking-tighter text-yellow">₦5,000</p>
              </div>
            </div>
            <div className="hover:bg-white/5 rounded p-1">
              <div className="md:h-42 md:w-42">
                <Image src='/images/book1.png' alt="book1" className="aspect-square rounded" height={500} width={500} />
              </div>
              <div className="mt-1">
                <h2 className="tracking-tighter text-xs md:text-sm truncate">Whispers in mist</h2>
                <p className="text-[10px] md:text-xs tracking-tighter text-yellow">₦5,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div>
            <h2 className="text-[#D9D9D9] tracking-tight">Top Picks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mt-2 gap-2">
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
            <div className="w-full rounded-lg bg-dblue px-2 py-1 flex items-center gap-2">
              <div className="w-3/12 h-full rounded">
                <Image src='/images/book5.png' alt="" className="rounded w-full h-full object-cover" height={500} width={500} />
              </div>
              <div className="w-full leading-3">
                <h2 className="tracking-tighter font-semibold mb-1 truncate">Other side of the river</h2>
                <p className="text-xs tracking-itghter">Patrick John</p>
                <span className="text-xs font-semibold">₦5,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}