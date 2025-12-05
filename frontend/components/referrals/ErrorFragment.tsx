"use client";
export default function ErrorFragment() {
  return (
    <main className="bg-[#0A192F] text-white w-full min-h-screen flex flex-col items-center justify-center space-y-3">
      <p className="text-gray-400">Error Loading Referral Stats.</p>
      <button onClick={() => window.location.reload()} className="py-2 px-4 rounded bg-blue text-sm hover:cursor-pointer">Reload</button>
    </main>
  );
}