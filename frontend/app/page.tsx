// 'use client';
// import Image from "next/image";
// import Link from "next/link";
// import { BsTwitterX } from "react-icons/bs";
// import { useState } from "react";
// import ReferralBox from "@/components/ReferralBox";

// export default function Home() {

//   const [submitted, setSubmitted] = useState(false);

//   return (
//       <main className="bg-[#0A192F] text-white h-dvh w-full overflow-hidden">
        
//           <div className="py-24 xl:py-0 relative w-11/12 mx-auto h-full flex flex-col md:flex-row justify-center items-center">
//             <div className="opacity-90 xl:opacity-100 h-full w-full xl:w-6/12 flex items-center justify-center md:justify-center xl:justify-end">
//               <div className="h-full xl:w-8/12 flex md:items-center justify-end">
//                 <Image src='/images/phone.png' width={500} height={500} className="h-fit xl:h-11/12 xl:w-fit border" alt="booka app" />
//               </div>
//             </div>
//             <div className="h-full fixed bottom-0 md:bottom-0 md:relative bg-gradient-to-t to-transparent from-[#0A192F] rounded py-8 w-full xl:w-7/12 flex items-end md:items-center justify-center xl:items-center xl:justify-start">
//               {!submitted ? (
//                 <div className="w-full md:w-full xl:w-7/12 flex flex-col justify-center items-center text-center">
//                   <h1 className="w-11/12 xl:w-full bold-text text-[#00C6FF] text-2xl md:text-2xl lg:text-3xl xl:text-2xl font-semibold uppercase leading-7">Order textbooks with ease, not queues.</h1>
//                   <p className="w-11/12 font-light text-sm md:text-xs mt-4 mb-4">A smarter way for students to get their  books faster, cheaper and stress free, Skip the long queues, save money, and get your books with ease.</p>
//                   <form onSubmit={(e) => {
//                     e.preventDefault();
//                     setSubmitted(true);
//                   }}
//                   className="w-full text-sm flex justify-center items-center flex-col">
//                     <input type="email" className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded" name="email" placeholder="Enter your email address" />
//                     <div className="w-full flex justify-center items-center mt-4">
//                       <button type="submit" className="w-11/12 flex justify-center items-center text-center hover:cursor-pointer bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-102 duration-500 uppercase font-normal text-base">Join waitlist</button>
//                     </div>
                    
//                   </form>
//                   <div className="mt-4">
//                     <Link href={'https://x.com/bookaafrik'} target="_blank" className="flex items-center gap-1 text-[#FFD166] hover:underline">
//                       <BsTwitterX className="h-4 w-4" /><span className="ms-2 text-sm">Follow us on X for updates</span>
//                     </Link>
//                   </div>
//                 </div>
//               ) : (
//                 <ReferralBox onReferralSubmitAction={(code) => console.log("Referral code:", code)} />
//               )}
//             </div>
//           </div>
//       </main>
//   );
// }


'use client';
import Image from "next/image";
import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";
import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [hasReferral, setHasReferral] = useState<null | boolean>(null);
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { email, referralCode: hasReferral ? referralCode : null };
    console.log("Final Submission:", data);
    
  };

  return (
    <main className="bg-[#0A192F] text-white h-dvh w-full overflow-hidden">
      <div className="py-24 xl:py-0 relative w-11/12 mx-auto h-full flex flex-col md:flex-row justify-center items-center">
        {/* Left side image */}
        <div className="opacity-90 xl:opacity-100 h-full w-full xl:w-6/12 flex items-center justify-center xl:justify-end">
          <div className="h-full xl:w-8/12 flex md:items-center justify-end">
            <Image
              src="/images/phone.png"
              width={500}
              height={500}
              className="h-fit xl:h-11/12 xl:w-fit border"
              alt="booka app"
            />
          </div>
        </div>

        {/* Right side form */}
        <div className="h-full fixed bottom-0 md:relative bg-gradient-to-t to-transparent from-[#0A192F] rounded py-8 w-full xl:w-7/12 flex items-end md:items-center justify-center xl:justify-start">
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-full xl:w-7/12 flex flex-col justify-center items-center text-center"
          >
            <h1 className="w-11/12 xl:w-full bold-text text-[#00C6FF] text-2xl md:text-2xl lg:text-3xl xl:text-2xl font-semibold uppercase leading-7">
              Order textbooks with ease, not queues.
            </h1>
            <p className="w-11/12 text-base mt-4 mb-4">
              A smarter way for students to get their books faster, cheaper and stress free.
            </p>

            {/* Step 1 – Email input */}
            {step === 1 && (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
                  name="email"
                  placeholder="Enter your email address"
                />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!email}
                  className="w-11/12 mt-4 flex justify-center items-center text-center hover:cursor-pointer bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base disabled:opacity-50"
                >
                  Continue
                </button>
              </>
            )}

            {/* Step 2 – Referral Question */}
            {step === 2 && hasReferral === null && (
              <div className="mt-4 w-11/12 flex flex-col items-center">
                <h2 className="text-[#00C6FF] text-xl md:text-2xl font-semibold uppercase bold-text mb-2">
                  Were You Referred?
                </h2>
                <p className="text-base text-gray-300 mb-4">
                  Let us know if a friend invited you, <br/>you’ll both earn{" "}
                  <span className="text-[#FFD166]">Booka Points</span>!
                </p>
                <div className="w-full flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setHasReferral(true)}
                    className="bg-[#00C6FF] w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasReferral(false)}
                    className="bg-gray-700 w-6/12 px-6 py-2 rounded font-medium text-white hover:scale-105 transition-all"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Step 2B – Referral Code Input */}
            {step === 2 && hasReferral === true && (
              <div className="w-full mt-6 flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-gray-100 text-black w-11/12 border border-[#3a3737] outline-none py-3 ps-3 rounded"
                />
                <button
                  type="submit"
                  className="w-11/12 mt-4 bg-[#00C6FF] text-white py-3 px-3 rounded hover:scale-105 duration-500 uppercase font-normal text-base"
                >
                  Join Waitlist
                </button>
              </div>
            )}

            {/* Step 2C – No referral */}
            {step === 2 && hasReferral === false && (
              <div className="mt-6 w-11/12 flex flex-col items-center">
                <p className="text-gray-400 text-sm italic mb-2">
                  No worries — you’re still on the list!
                </p>
                <button
                  type="submit"
                  className="rounded w-full bg-[#00C6FF] py-3 hover:scale-105 hover:cursor-pointer duration-500 uppercase font-normal"
                >
                  Join Waitlist
                </button>
              </div>
            )}

            {/* Social Link */}
            <div className="mt-4">
              <Link
                href={"https://x.com/bookaafrik"}
                target="_blank"
                className="flex items-center gap-1 text-[#FFD166] hover:underline"
              >
                <BsTwitterX className="h-4 w-4" />
                <span className="ms-2 text-sm">Follow us on X for updates</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}