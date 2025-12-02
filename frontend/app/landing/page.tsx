import Navbar from "@/components/home/Navbar";

export default function LandingPage() {
    return (
        <main className="">
            <Navbar />
            <section className="relative pt-12 bg w-full h-screen">
                <div className="absolute inset-0 z-20 w-11/12 mx-auto h-full pt-12">
                    <div className="h-full gap-y-6 w-full md:w-7/12 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-7xl font-semibold tracking-tighter text-blue">Order textbooks with ease, not queues.</h1>
                        <p className="text-sm md:text-base tracking-tighter">A smarter way for students to get their textbooks faster and without stress.</p>
                    </div>
                </div>
                <div className="z-10 h-screen absolute inset-0 overlay bg-black/[.3]"></div>
            </section>
        </main>
    );
}