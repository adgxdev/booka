"use client";
import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  universityId: string;
  department: string;
  level: string;
}

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    universityId: "",
    department: "",
    level: "",
  });

  // Handle field updates
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.name || formData.name.length < 5 || !formData.email || !formData.password || !formData.phoneNumber) {
      toast("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  const handleBack = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!formData.universityId || !formData.department || !formData.level) {
      toast("Please fill in all required fields.");
      return;
    }

    // Convert level from "300 Level" → 300
    const numericLevel = Number(formData.level.split(" ")[0]);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      department: formData.department,
      level: numericLevel,
      universityId: formData.universityId, // must be uuid from dropdown
    };

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/signup-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // allows cookies if backend sets any
      });
      const data = await res.json();
      console.log("Response:", data);

      if (data.success) {
        toast("Signup successful!");
        // router.push("/signin")
      } else {
        toast(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      toast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-11/12 max-w-md mx-auto flex flex-col gap-y-5">
      {step === 1 ? (
        <>
          <div className="w-full flex justify-center text-center">
            <h1 className="text-2xl font-bold tracking-tighter leading-7 text-[#00C6FF]">
              Welcome back!
              <br />
              Sign Up to continue
            </h1>
          </div>

          <button
            type="button"
            className="flex justify-center items-center mt-9 w-full bg-[#0a2245]/70 backdrop-blur-sm border border-white/10 text-sm rounded-lg py-3 px-3 space-x-3 text-white hover:scale-105 duration-300"
          >
            <FcGoogle className="h-6 w-6" />
            <span>Sign Up with Google</span>
          </button>

          <div className="text-center flex justify-center items-center">Or</div>

          <form onSubmit={handleNext}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              placeholder="Name"
              className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none"
              required
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            />
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              type="number"
              placeholder="Phone number"
              className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#1A73E8] to-[#00C6FF] text-base font-semibold rounded-lg py-3 px-3 text-white mt-6 hover:scale-105 duration-300"
            >
              Next
            </button>
          </form>

          <div className="mt-6 mb-6 space-y-8 flex flex-col items-center text-center">
            <p className="text-yellow italic md:w-9/12 text-center text-sm">
              By signing you agree with <br />
              our friendly terms and conditions
            </p>
            <div className="flex items-center gap-1 text-sm">
              <span>Already have an account?</span>
              <Link href="/signin" className="text-[#00C6FF] font-semibold hover:text-blue/80">
                Sign In
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full flex justify-center text-center mb-4">
            <h1 className="text-2xl font-bold tracking-tighter  text-blue">
              Other Information
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <select
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 focus:outline-none"
              required
            >
              <option value="">Select University</option>
              <option value="unnid">UNN</option>
              <option value="unecid">UNEC</option>
            </select>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Political Science">Political Science</option>
            </select>

            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            >
              <option value="">Select Level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="600">600 Level</option>
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="w-1/2 bg-gray-200 text-gray-800 rounded-lg py-3 px-3 hover:bg-gray-300 duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-gradient-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-3 px-3 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="w-full mt-6 mb-6 space-y-8 flex flex-col items-center text-center">
            <p className="text-yellow italic md:w-9/12 text-center text-sm">
              By signing you agree with <br />
              our friendly terms and conditions
            </p>
            <div className="flex items-center gap-1 text-sm">
              <span>Already have an account?</span>
              <Link href="/signin" className="text-blue font-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}