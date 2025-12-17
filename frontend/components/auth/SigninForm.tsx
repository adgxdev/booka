"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function SigninForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) =>({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);

        try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/login-user`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
            }
        );

        const data = await res.json();
        console.log("Login response:", data);

        if (res.ok) {
            // if success
            router.push("/dashboard"); // redirect to dashboard
        } else {
            toast(data.message || "Login failed");
        }
        } catch (error) {
        console.error(error);
            toast("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-11/12 max-w-md flex flex-col gap-y-5">
            <button
            type="button"
            className="flex justify-center items-center mt-9 w-full bg-[#0a2245]/70 backdrop-blur-sm border border-white/10 text-sm rounded-lg py-3 px-3 space-x-3 text-white hover:scale-105 duration-300"
            >
                <FcGoogle className="h-6 w-6" />
                <span>Sign In with Google</span>
            </button>
            <div className="text-center flex justify-center items-center">Or</div>
            <form onSubmit={handleSubmit}>
                <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email or Phone number"
                required 
                className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none" />

                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required 
                className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none" />

                <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-3 px-3 text-white mt-6 hover:scale-105 duration-500">Log in</button>

                <div className="mt-6 mb-6 space-y-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-sm">
                        <span>Don&apos;t have an account?</span>
                        <Link href="/signup" className="text-blue font-semibold hover:text-blue/80 duration-500">
                            Sign Up
                        </Link>
                    </div>
                </div>
                <div className="mt-6 mb-6 space-y-8 flex flex-col items-center text-center">
                    <Link href="/forgot-password" className="text-yellow text-sm hover:text-yellow/80 duration-500">Forgot password?</Link>
                </div>
            </form>
        </div>
    );
}