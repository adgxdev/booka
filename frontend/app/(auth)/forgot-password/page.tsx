'use client';
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import SimpleNav from "@/components/SimpleNav";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {

    // const sendPasswordResetLink = async (email: string) => {
    //     // Implement the logic to send a password reset link to the provided email
    //     console.log(`Sending password reset link to ${email}`);
    // }

    return (
        <main className="w-full h-screen text-white relative">
            <SimpleNav />
            <Link href={'#'} className="md:hidden fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="z-30 h-full w-11/12 mx-auto flex flex-col items-center pt-30">
                <div className="w-full flex flex-col justify-center text-center">
                    <h1 className="text-2xl font-bold tracking-tighter text-[#00C6FF]">Forgot your password?</h1>
                    <p className="text-sm my-4">Enter your email address  and we will <br className="md:hidden"/>send you a link to reset your password </p> 
                </div>
                <ForgotPasswordForm />
            </div>
        </main>
    );
}