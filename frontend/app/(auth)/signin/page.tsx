import SigninForm from "@/components/auth/SigninForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SigninPage() {
    return (
        <main className="w-full h-screen text-white relative">
            <Link href={'#'} className="fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="z-30 h-full w-11/12 mx-auto flex flex-col items-center pt-30">
                
                <div className="w-full flex justify-center text-center">
                   <h1 className="text-2xl font-semibold text-[#00C6FF]">Welcome back! <br/>Sign In to continue</h1> 
                </div>
                <SigninForm />
            </div>
        </main>
    );
}