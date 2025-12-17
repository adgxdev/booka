import SigninForm from "@/components/auth/SigninForm";
import SimpleNav from "@/components/SimpleNav";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SigninPage() {
    return (
        <main className="w-full h-screen md:h-auto text-white relative">
            <SimpleNav />
            <Link href={'/'} className="md:hidden fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="z-30 h-full w-11/12 mx-auto flex flex-col items-center pt-30">
                
                <div className="w-full flex justify-center text-center">
                   <h1 className="text-2xl font-bold text-[#00C6FF] tracking-tighter">Welcome back! <br/>Sign In to continue</h1> 
                </div>
                <SigninForm />
            </div>
        </main>
    );
}