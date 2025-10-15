import Image from "next/image";

export default function Home() {
  return (
      <main className="bg-linear-to-b from-white to-[#2DCC70B2] h-screen w-full">
        <section className="w-11/12 mx-auto h-full flex justify-center items-center">
          
          <div className="relative z-20 w-full md:w-10/12 lg::w-8/12 flex flex-col justify-center items-center text-center">
            <div className="absolute -z-10 bottom-16 md:bottom-14 w-11/12 md:w-8/12 xl:w-6/12 mx-auto h-auto">
              <Image src='/images/phone.png' height={600} width={600} className="opacity-30 object-cover object-top md:h-full w-fit md:w-full" alt="App diplay" />
            </div>
            <h1 className="text-green-800 bold-text text-4xl md:text-7xl lg:text-8xl leading-10 md:leading-18 lg:leading-22">Booka is <br className=""/>Coming Soon</h1>
            <p className="md:w-7/12 xl:w-5/12 text-sm md:text-base text-black mt-6 mb-4 bold-text">A smarter way for students to get their  books-faster, cheaper and stress free.</p>
            <div className="bg-black text-white py-1 px-1.5 rounded-xl w-full md:w-9/12 xl:w-7/12 mx-auto flex justify-center items-center gap-1.5">
              <input type="email" className="bold-text w-9/12 border border-[#3a3737] outline-none rounded-lg py-2 ps-3" name="email" placeholder="Enter your email address" />
              <button type="submit" className="hover:cursor-pointer bg-[#2DCC70B2] text-white py-2 px-3 rounded-md w-5/12 lg:w-3/12 bold-text hover:scale-102 duration-500">Notify Me</button>
            </div>
            <p className="mt-1 text-black bold-text text-sm">Be the first to experience Booka When we launch at UNN.</p>
          </div>
        </section>
      </main>
  );
}
