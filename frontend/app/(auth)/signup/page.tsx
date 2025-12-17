import SignupForm from "@/components/auth/SignupForm";
import SimpleNav from "@/components/SimpleNav";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    return (
        <main className="h-screen md:h-auto text-white relative">
            <SimpleNav />
            <Link href={'/'} className="md:hidden fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="z-30 h-full w-11/12 mx-auto flex flex-col items-center pt-30">
                <SignupForm />
            </div>
        </main>
    );
}