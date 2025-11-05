import Image from "next/image";
import Link from "next/link";

export default function SigninForm() {
    return (
        <div className="w-11/12 flex flex-col gap-y-5">
            <button type="submit" className="flex justify-center items-center mt-9 w-full bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-4 px-3 space-x-3 text-white">
                <Image src='/icons/google.png' alt="google icon" className="h-7 w-7" height={100} width={100} /><span>Sign In with Google</span>
            </button>
            <div className="text-center flex justify-center items-center">Or</div>
            <form>
                <input type="email" placeholder="Email or Phone number" className="w-full bg-white text-black placeholder-black rounded-lg py-4 px-3 mt-4 focus:outline-none" />
                <input type="password" placeholder="Password" className="w-full bg-white text-black placeholder-black rounded-lg py-4 px-3 mt-4 focus:outline-none" />
                <button type="submit" className="w-full bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-4 px-3 text-white mt-6">Log in</button>
            </form>
            <div className="mt-6 space-y-8 flex flex-col items-center text-center">
                <Link href="/forgot-password" className="">Forgot password?</Link>
            </div>
        </div>
    );
}