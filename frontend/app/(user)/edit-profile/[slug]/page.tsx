import SimpleNav from "@/components/SimpleNav";
import { ChevronLeft, CircleUserRound } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  
  return (
    <main className="w-full min-h-screen relative text-white">
      <SimpleNav />
      <Link href={'#'} className="md:hidden fixed left-5 top-6">
          <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
      </Link>
        <div className="max-w-md h-full w-11/12 mx-auto pb-24">
            <div className="flex flex-col justify-center items-center text-center pt-30 space-y-3">
                <h1 className="text-2xl font-semibold text-[#00C6FF]">Edit Profile</h1>
                <div>
                    <CircleUserRound className="text-[#00C6FF] h-24 w-24" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#00C6FF]">Agoha Isdore</h2>
                    <p className="text-sm text-gray-400">Agric Economics and Extension</p>
                </div>
            </div>
            <div className="flex flex-col mt-10 p-3 border-2 border-[#00C6FF] rounded-lg">
                <form className="flex flex-col space-y-4">
                  <input 
                  type="text"
                  name="name"
                  placeholder="Name"
                  required 
                  className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none" />
                  <select className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none">
                    <option value="">Search University</option>
                    <option value="">UNN</option>
                    <option value="">UNEC</option>
                    <option value="">LASU</option>
                  </select>
                  <select className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none">
                    <option value="">Department</option>
                    <option value="">Computer Science</option>
                    <option value="">Political Science</option>
                    <option value="">Pharmacy</option>
                  </select>
                  <select className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none">
                    <option value="">Level</option>
                    <option value="">100 Level</option>
                    <option value="">200 Level</option>
                    <option value="">300 Level</option>
                    <option value="">400 Level</option>
                    <option value="">500 Level</option>
                    <option value="">600 Level</option>
                  </select>
                  <button type="submit" className="py-2 px-4 rounded-lg bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-white hover:scale-102 duration-500">Save Changes</button>
                </form>
            </div>
        </div>
    </main>
  );
}