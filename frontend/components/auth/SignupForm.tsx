"use client";

import { useState } from "react";
// import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

interface FormData {
  username: string;
  email: string;
  password: string;
  university: string;
  department: string;
  level: string;
}

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    university: "",
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
    setStep(2);
  };

  const handleBack = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    // You can now send formData to your API
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
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
              placeholder="Username"
              className="w-full bg-white text-black placeholder-black rounded-lg py-2.5 px-3 focus:outline-none"
              required
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email or Phone number"
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
            <p className="text-yellow italic w-9/12 text-center text-sm">
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
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 focus:outline-none"
              required
            >
              <option value="">Select University</option>
              <option>UNN</option>
              <option>UNEC</option>
            </select>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            >
              <option value="">Select Department</option>
              <option>Computer Science</option>
              <option>Pharmacy</option>
              <option>Political Science</option>
            </select>

            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-white text-black rounded-lg py-2.5 px-3 mt-4 focus:outline-none"
              required
            >
              <option value="">Select Level</option>
              <option>100 Level</option>
              <option>200 Level</option>
              <option>300 Level</option>
              <option>400 Level</option>
              <option>500 Level</option>
              <option>600 Level</option>
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
                className="w-1/2 bg-gradient-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-3 px-3 text-white"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6 mb-6 space-y-8 flex flex-col items-center text-center">
            <p className="text-yellow italic w-9/12 text-center text-sm">
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