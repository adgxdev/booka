export default function Footer() {
  return (
    <footer className="w-full py-6 border border-white/10 bg-[#0a2245] rounded-t-3xl mt-4">
      <div className="max-w-[1440px] w-11/12 mx-auto flex flex-col md:flex-row justify-between items-center">
        <span className="text-sm">&copy; {new Date().getFullYear()} Booka. All rights reserved.</span>
        <div className="flex gap-6 mt-3 md:mt-0">
          <a href="#" className="text-sm hover:text-blue duration-500">Privacy Policy</a>
          <a href="#" className="text-sm hover:text-blue duration-500">Terms of Service</a>
          <a href="#" className="text-sm hover:text-blue duration-500">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}