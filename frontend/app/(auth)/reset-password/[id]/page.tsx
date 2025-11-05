'use client';
import NewPassForm from "@/components/auth/NewPassForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";

export default function ResetPasswordPage({ params, }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    // const [isLoading, setIsLoading] = useState(false);
    // const [isAllowed, setIsAllowed] = useState(false);

    // check the dynamic id param for changing password
    useEffect(() => {
        // You can use the id parameter here for any side effects if needed
        console.log("Resetting password for user ID:", id);
    }, [id]);

    // if(isLoading){
    //     return (
    //         <div>
    //             <h1>Loading...</h1>
    //         </div>
    //     )
    // }

    return (
        <main className="w-full h-screen text-white relative">
            <Link href={'#'} className="fixed left-5 top-6">
                <ChevronLeft className="h-8 w-8 text-[#00C6FF]" />
            </Link>
            <div className="z-30 h-full w-11/12 mx-auto flex flex-col items-center pt-30">
                <div className="w-full flex flex-col justify-center text-center">
                    <Link href={'/'} className="">
                        <h1 className="text-[#00C6FF] text-3xl font-bold bold-text mb-6">Booka</h1>
                    </Link>
                    <h1 className="text-2xl font-semibold text-[#00C6FF] mb-4">Choose a new password?</h1>
                </div>
                <NewPassForm />
            </div>
        </main>
    );
}